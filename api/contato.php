<?php
/**
 * Lamparina Hub — envio do formulário de Contato via Brevo (API transacional v3).
 *
 * Recebe POST (JSON ou form-data) com: nome, whatsapp, empresa, faturamento.
 * Lê a configuração do arquivo .env (veja .env.example na raiz do projeto).
 * Responde JSON: { "ok": true } ou { "ok": false, "error": "..." }.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---------- .env ---------- */
function load_env(): array
{
    // Procura primeiro FORA da pasta pública (um nível acima da raiz do site), depois na raiz do site.
    $candidates = [
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__) . '/.env',
    ];
    foreach ($candidates as $file) {
        if (!is_readable($file)) continue;
        $vars = [];
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
            [$k, $v] = explode('=', $line, 2);
            $v = trim($v);
            if (strlen($v) >= 2 && ($v[0] === '"' || $v[0] === "'") && $v[-1] === $v[0]) $v = substr($v, 1, -1);
            $vars[trim($k)] = $v;
        }
        return $vars;
    }
    return [];
}

function env(array $env, string $key, string $default = ''): string
{
    $v = $env[$key] ?? getenv($key);
    return ($v === false || $v === null || $v === '') ? $default : (string) $v;
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

$env = load_env();

/* ---------- Método e origem ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') respond(204, []);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'error' => 'Método não permitido.']);

$allowed = array_filter(array_map('trim', explode(',', env($env, 'ALLOWED_ORIGINS'))));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($allowed && $origin !== '') {
    if (!in_array($origin, $allowed, true)) respond(403, ['ok' => false, 'error' => 'Origem não permitida.']);
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

/* ---------- Dados ---------- */
$raw = file_get_contents('php://input') ?: '';
$data = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? (json_decode($raw, true) ?: []) : $_POST;

// Honeypot: campo invisível que só robô preenche. Finge sucesso e não envia.
if (!empty($data['website'])) respond(200, ['ok' => true]);

$clean = static fn($v, int $max) => mb_substr(trim(strip_tags((string) ($v ?? ''))), 0, $max);
$nome        = $clean($data['nome'] ?? '', 120);
$whatsapp    = $clean($data['whatsapp'] ?? '', 30);
$empresa     = $clean($data['empresa'] ?? '', 160);
$faturamento = $clean($data['faturamento'] ?? '', 60);

$faixas = ['até R$ 100 mil', 'R$ 100 mil a R$ 400 mil', 'R$ 400 mil a R$ 1 milhão', 'acima de R$ 1 milhão'];
$digits = preg_replace('/\D/', '', $whatsapp);

$erros = [];
if ($nome === '') $erros[] = 'nome';
if (strlen($digits) < 10 || strlen($digits) > 13) $erros[] = 'whatsapp';
if ($empresa === '') $erros[] = 'empresa';
if (!in_array($faturamento, $faixas, true)) $erros[] = 'faturamento';
if ($erros) respond(422, ['ok' => false, 'error' => 'Campos inválidos: ' . implode(', ', $erros) . '.']);

/* ---------- Limite simples por IP (5 envios a cada 10 min) ---------- */
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/lamparina_form_' . md5($ip);
$now = time();
$hits = is_readable($rlFile) ? array_filter(array_map('intval', explode(',', (string) file_get_contents($rlFile))), fn($t) => $t > $now - 600) : [];
if (count($hits) >= 5) respond(429, ['ok' => false, 'error' => 'Muitas tentativas. Tente de novo em alguns minutos.']);
$hits[] = $now;
@file_put_contents($rlFile, implode(',', $hits), LOCK_EX);

/* ---------- Configuração do Brevo ---------- */
$apiKey   = env($env, 'BREVO_API_KEY');
$fromMail = env($env, 'MAIL_FROM_EMAIL');
$fromName = env($env, 'MAIL_FROM_NAME', 'Lamparina');
$toMail   = env($env, 'MAIL_TO_EMAIL');
$toName   = env($env, 'MAIL_TO_NAME', 'Lamparina Hub');
$subjectP = env($env, 'MAIL_SUBJECT_PREFIX', 'Novo contato pelo site');

if ($apiKey === '' || $fromMail === '' || $toMail === '') {
    error_log('[contato.php] .env incompleto: defina BREVO_API_KEY, MAIL_FROM_EMAIL e MAIL_TO_EMAIL.');
    respond(500, ['ok' => false, 'error' => 'Envio indisponível no momento.']);
}

/* ---------- E-mail ---------- */
$e = static fn(string $s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$waNumber = (strlen($digits) <= 11 ? '55' : '') . $digits;
$waLink = 'https://wa.me/' . $waNumber;
$quando = (new DateTime('now', new DateTimeZone('America/Belem')))->format('d/m/Y \à\s H:i');

$linhas = [
    'Nome'           => $e($nome),
    'WhatsApp'       => '<a href="' . $e($waLink) . '" style="color:#FF5A00;text-decoration:none;font-weight:600">' . $e($whatsapp) . '</a>',
    'Empresa'        => $e($empresa),
    'Faturamento'    => $e($faturamento),
    'Recebido em'    => $e($quando),
];
$rows = '';
foreach ($linhas as $label => $valor) {
    $rows .= '<tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#777;font-size:13px;width:130px;vertical-align:top">' . $label . '</td>'
           . '<td style="padding:12px 0;border-bottom:1px solid #eee;color:#111;font-size:15px">' . $valor . '</td></tr>';
}

$html = '<!doctype html><html><body style="margin:0;background:#f4f2f0;font-family:Arial,Helvetica,sans-serif">'
      . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2f0;padding:32px 12px"><tr><td align="center">'
      . '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px;overflow:hidden">'
      . '<tr><td style="background:#0A0A0A;padding:22px 28px;color:#fff;font-size:18px;font-weight:700">Lamparina Hub <span style="color:#FF5A00">·</span> <span style="font-weight:400;color:#bbb;font-size:14px">Novo contato pelo site</span></td></tr>'
      . '<tr><td style="padding:24px 28px 8px"><table width="100%" cellpadding="0" cellspacing="0">' . $rows . '</table></td></tr>'
      . '<tr><td style="padding:20px 28px 28px"><a href="' . $e($waLink) . '" style="display:inline-block;background:#25D366;color:#0A0A0A;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Chamar no WhatsApp</a></td></tr>'
      . '</table></td></tr></table></body></html>';

$text = "Novo contato pelo site\n\nNome: $nome\nWhatsApp: $whatsapp ($waLink)\nEmpresa: $empresa\nFaturamento: $faturamento\nRecebido em: $quando\n";

$payload = [
    'sender'      => ['email' => $fromMail, 'name' => $fromName],
    'to'          => [['email' => $toMail, 'name' => $toName]],
    'subject'     => $subjectP . ': ' . $nome . ' (' . $empresa . ')',
    'htmlContent' => $html,
    'textContent' => $text,
    'tags'        => ['site-contato'],
];

$ch = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'accept: application/json',
        'content-type: application/json',
        'api-key: ' . $apiKey,
    ],
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
]);
$resp = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($resp === false || $code < 200 || $code >= 300) {
    error_log('[contato.php] Brevo falhou: HTTP ' . $code . ' ' . $err . ' ' . (string) $resp);
    respond(502, ['ok' => false, 'error' => 'Não foi possível enviar agora.']);
}

respond(200, ['ok' => true]);
