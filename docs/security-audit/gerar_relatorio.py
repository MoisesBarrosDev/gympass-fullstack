#!/usr/bin/env python3
"""Gera o relatório de auditoria de segurança do GymPass Fullstack.

Dependência: Pillow. Exemplo de execução isolada:
  python3 -m venv --system-site-packages /tmp/gympass-audit-venv
  /tmp/gympass-audit-venv/bin/python docs/security-audit/gerar_relatorio.py
"""

from __future__ import annotations

import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = Path(__file__).with_name("relatorio-auditoria-seguranca.pdf")
W, H = 1240, 1754
MARGIN = 88
COLORS = {
    "ink": "#17202A", "muted": "#5F6B76", "line": "#DDE3E8",
    "paper": "#F7F9F8", "white": "#FFFFFF", "critical": "#B91C1C",
    "high": "#EA580C", "medium": "#D97706", "low": "#2563EB",
    "strong": "#059669", "soft_green": "#E8F5EF", "soft_orange": "#FFF3E8",
    "navy": "#153A34", "pale": "#EEF3F1",
}
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")


def font(size: int, bold: bool = False, mono: bool = False):
    if mono:
        name = "DejaVuSansMono.ttf"
    else:
        name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(FONT_DIR / name), size)


class Report:
    def __init__(self):
        self.pages: list[Image.Image] = []
        self.img: Image.Image | None = None
        self.d: ImageDraw.ImageDraw | None = None
        self.y = MARGIN

    def page(self, title: str | None = None, cover: bool = False):
        if self.img is not None:
            self.pages.append(self.img)
        self.img = Image.new("RGB", (W, H), COLORS["paper"])
        self.d = ImageDraw.Draw(self.img)
        self.y = MARGIN
        if not cover:
            self.d.rectangle((0, 0, W, 16), fill=COLORS["navy"])
            self.d.text((MARGIN, 40), "RELATÓRIO DE AUDITORIA DE SEGURANÇA — GYMPASS FULLSTACK", font=font(17, True), fill=COLORS["navy"])
            self.d.line((MARGIN, 72, W - MARGIN, 72), fill=COLORS["line"], width=2)
            self.y = 108
            if title:
                self.heading(title, 38)

    def finish(self):
        if self.img is not None:
            self.pages.append(self.img)
        total = len(self.pages)
        for i, img in enumerate(self.pages, 1):
            d = ImageDraw.Draw(img)
            if i > 1:
                d.line((MARGIN, H - 65, W - MARGIN, H - 65), fill=COLORS["line"], width=2)
                d.text((MARGIN, H - 48), "GymPass Fullstack • Auditoria estática • 01/09/2026", font=font(14), fill=COLORS["muted"])
                label = f"{i} / {total}"
                tw = d.textlength(label, font=font(14, True))
                d.text((W - MARGIN - tw, H - 48), label, font=font(14, True), fill=COLORS["navy"])
        self.pages[0].save(OUTPUT, "PDF", resolution=144.0, save_all=True, append_images=self.pages[1:])

    def heading(self, text: str, size: int = 30, color: str | None = None):
        self.d.text((MARGIN, self.y), text, font=font(size, True), fill=color or COLORS["ink"])
        self.y += size + 24

    def para(self, text: str, size: int = 20, color: str | None = None, width: int = 86, gap: int = 16, bullet: bool = False):
        prefix = "• " if bullet else ""
        lines = textwrap.wrap(prefix + text, width=width, break_long_words=False, replace_whitespace=False) or [""]
        lh = int(size * 1.48)
        for line in lines:
            self.d.text((MARGIN, self.y), line, font=font(size), fill=color or COLORS["ink"])
            self.y += lh
        self.y += gap

    def label(self, text: str, color: str):
        f = font(15, True)
        tw = self.d.textlength(text, font=f)
        self.d.rounded_rectangle((MARGIN, self.y, MARGIN + tw + 30, self.y + 34), 17, fill=color)
        self.d.text((MARGIN + 15, self.y + 7), text, font=f, fill=COLORS["white"])
        self.y += 52

    def code(self, text: str, size: int = 15):
        lines = text.splitlines()
        lh = int(size * 1.5)
        h = len(lines) * lh + 28
        self.d.rounded_rectangle((MARGIN, self.y, W - MARGIN, self.y + h), 12, fill="#202A31")
        yy = self.y + 14
        for line in lines:
            self.d.text((MARGIN + 18, yy), line, font=font(size, mono=True), fill="#F4F7F6")
            yy += lh
        self.y += h + 20

    def card(self, title: str, body: str, color: str, height: int = 170):
        y = self.y
        self.d.rounded_rectangle((MARGIN, y, W - MARGIN, y + height), 18, fill=COLORS["white"], outline=COLORS["line"], width=2)
        self.d.rectangle((MARGIN, y, MARGIN + 10, y + height), fill=color)
        self.d.text((MARGIN + 34, y + 24), title, font=font(22, True), fill=color)
        yy = y + 65
        for line in textwrap.wrap(body, 82, break_long_words=False):
            self.d.text((MARGIN + 34, yy), line, font=font(17), fill=COLORS["ink"])
            yy += 27
        self.y += height + 20


def cover(r: Report):
    r.page(cover=True)
    r.d.rectangle((0, 0, W, H), fill=COLORS["navy"])
    r.d.ellipse((780, -180, 1380, 420), fill="#1D5148")
    r.d.ellipse((-250, 1260, 420, 1930), fill="#0F302B")
    r.d.text((MARGIN, 150), "GYMPASS FULLSTACK", font=font(20, True), fill="#7EE0C0")
    r.d.text((MARGIN, 315), "Relatório de", font=font(56, True), fill=COLORS["white"])
    r.d.text((MARGIN, 385), "Auditoria de Segurança", font=font(56, True), fill=COLORS["white"])
    r.d.text((MARGIN, 485), "Revisão estática orientada a cinco classes de risco", font=font(25), fill="#C5D8D2")
    r.d.rounded_rectangle((MARGIN, 610, W - MARGIN, 1030), 24, fill="#FFFFFF")
    details = [
        ("DATA", "1º de setembro de 2026"),
        ("ESCOPO", "API Fastify/Prisma, frontend Next.js/React, PostgreSQL,"),
        ("", "Docker Compose, GitHub Actions e histórico Git completo."),
        ("MÉTODO", "Isolamento e posse, autorização servidor/UI, IDOR,"),
        ("", "segredos hardcoded/históricos e sinks de XSS."),
    ]
    yy = 660
    for key, value in details:
        if key:
            r.d.text((MARGIN + 42, yy), key, font=font(15, True), fill=COLORS["strong"])
        r.d.text((MARGIN + 180, yy), value, font=font(20), fill=COLORS["ink"])
        yy += 54
    r.d.text((MARGIN, 1480), "4 achados verificados  •  2 altos  •  2 médios", font=font(23, True), fill=COLORS["white"])
    r.d.text((MARGIN, 1530), "Nenhum achado crítico. Nenhum IDOR ou XSS confirmado.", font=font(19), fill="#C5D8D2")


def methodology(r: Report):
    r.page("Stack detectada e metodologia")
    r.card("Backend", "TypeScript 6, Fastify 5, Zod 4, Prisma 7 e PostgreSQL. Consultas ORM e uma query SQL parametrizada com tagged template do Prisma.", COLORS["navy"], 165)
    r.card("Autenticação e autorização", "JWT assinado por @fastify/jwt. Access token de 15 minutos; refresh token em cookie HttpOnly/SameSite=Strict com rotação persistida. RBAC ADMIN/MEMBER em middleware de rota.", COLORS["strong"], 190)
    r.card("Frontend", "Next.js 16, React 19 e TypeScript. Access token mantido em memória. JSX fornece escape padrão; CSP com nonce e cabeçalhos defensivos.", COLORS["low"], 165)
    r.card("Deploy e automação", "Vercel (API Fastify), Docker Compose para PostgreSQL local e GitHub Actions para testes unitários/E2E. Não há Helm ou Terraform.", COLORS["medium"], 165)
    r.heading("Mapeamento das cinco categorias", 26)
    r.para("1. Isolamento: o domínio não possui tenant/workspace. Academias são globais; dados pessoais de check-in usam filtro manual por user_id derivado do JWT.", 17, width=100, bullet=True, gap=8)
    r.para("2. Permissões: cada gate role/isAdmin do React foi cruzado com a rota Fastify e sua cadeia controller → service → repository.", 17, width=100, bullet=True, gap=8)
    r.para("3. IDOR: todos os 26 handlers HTTP foram inventariados; parâmetros gymId/checkInId e IDs vindos do JWT foram revisados.", 17, width=100, bullet=True, gap=8)
    r.para("4. Segredos: árvore atual, dotfiles rastreados, deploy/CI, bundle .next e todas as revisões Git foram pesquisados.", 17, width=100, bullet=True, gap=8)
    r.para("5. XSS: sinks HTML/JS/URL, markdown/templates, escape do React, validação de telefone e CSP foram verificados.", 17, width=100, bullet=True, gap=8)


def summary(r: Report):
    r.page("Resumo executivo")
    r.para("Foram confirmados quatro achados: dois de severidade alta e dois de severidade média. O risco dominante é a possibilidade de implantação com segredo JWT público ou fraco; nesse cenário, um atacante pode assinar um token com role ADMIN. A autorização administrativa atual está corretamente no servidor, com uma exceção: a UI restringe check-in a MEMBER, mas a API aceita ADMIN.", 20, width=88)
    r.heading("Distribuição por severidade", 25)
    cx, cy, rad = 340, r.y + 190, 150
    colors = [COLORS["high"], COLORS["medium"]]
    start = -90
    for color in colors:
        r.d.pieslice((cx-rad, cy-rad, cx+rad, cy+rad), start, start+180, fill=color)
        start += 180
    r.d.ellipse((cx-82, cy-82, cx+82, cy+82), fill=COLORS["paper"])
    r.d.text((cx-22, cy-30), "4", font=font(45, True), fill=COLORS["ink"])
    r.d.text((cx-52, cy+28), "achados", font=font(17), fill=COLORS["muted"])
    r.d.rectangle((570, cy-65, 600, cy-35), fill=COLORS["high"])
    r.d.text((620, cy-68), "Alta  2", font=font(22, True), fill=COLORS["ink"])
    r.d.rectangle((570, cy+25, 600, cy+55), fill=COLORS["medium"])
    r.d.text((620, cy+22), "Média  2", font=font(22, True), fill=COLORS["ink"])
    r.y = cy + rad + 75
    r.heading("Achados por categoria", 25)
    labels = [("Banco/isolamento", 0), ("Permissão no navegador", 1), ("IDOR", 0), ("Chaves expostas", 3), ("XSS", 0)]
    yy = r.y
    for label, value in labels:
        r.d.text((MARGIN, yy), label, font=font(18), fill=COLORS["ink"])
        r.d.rounded_rectangle((410, yy+2, 990, yy+28), 13, fill="#E5EAE8")
        if value:
            r.d.rounded_rectangle((410, yy+2, 410 + value * 180, yy+28), 13, fill=COLORS["high"] if value >= 2 else COLORS["medium"])
        r.d.text((1020, yy-1), str(value), font=font(19, True), fill=COLORS["ink"])
        yy += 62
    r.y = yy + 15
    r.card("Conclusão", "A postura geral de autorização e XSS é boa. A prioridade imediata é impedir segredos JWT conhecidos/fracos e confirmar a rotação do valor histórico. Em seguida, alinhar a regra MEMBER no endpoint de check-in e endurecer o Compose local.", COLORS["strong"], 190)


def strengths(r: Report):
    r.page("Pontos fortes e pontos fracos")
    r.heading("Pontos fortes — com evidência", 26, COLORS["strong"])
    strengths = [
        "Dados pessoais isolados pelo sujeito autenticado: history usa req.user.sub (controller linhas 13–16) e o repositório filtra user_id (linhas 44–57).",
        "Métrica pessoal usa req.user.sub (get-user-check-ins-count.ts:8–10) e count com where user_id (prisma-check-ins-repository.ts:136–142).",
        "Perfil ignora qualquer ID externo e carrega apenas req.user.sub; password_hash é removido da resposta (profile.ts:7–14).",
        "Todas as 13 operações administrativas cruzadas usam verifyJWT + verifyUserRole(\"ADMIN\") nas rotas de academias e check-ins.",
        "IDs de rota são validados como UUID por Zod; SQL geoespacial usa interpolação parametrizada do Prisma, não concatenação.",
        "Refresh token é HttpOnly, SameSite=Strict, rotacionado atomicamente e vinculado ao user_id; access token fica em memória no frontend.",
        "Não há dangerouslySetInnerHTML, innerHTML, eval, new Function, markdown ou template de e-mail. React escapa os valores persistidos.",
        "O href tel: recebe telefone restrito por regex no backend (gym-schema.ts:12–18), impedindo esquema javascript:.",
        "CSP restringe scripts por nonce e não permite object-src; unsafe-eval existe apenas em desenvolvimento (proxy.ts:6–17).",
    ]
    for item in strengths:
        r.para(item, 16, width=107, bullet=True, gap=5)
    r.heading("Pontos fracos centrais", 26, COLORS["high"])
    r.para("Segredo de assinatura publicamente conhecido no histórico e nenhuma política de entropia/denylist no startup.", 17, width=103, bullet=True, gap=7)
    r.para("Credenciais docker/docker com PostgreSQL publicado em todas as interfaces pelo Compose.", 17, width=103, bullet=True, gap=7)
    r.para("A restrição MEMBER para check-in existe na renderização, mas não na rota da API.", 17, width=103, bullet=True, gap=7)


FINDINGS = [
    ("F-01", "ALTA", COLORS["high"], "Chave JWT pública permanece no histórico Git", ".env.example@0427630:2", "Um valor de assinatura com aparência de segredo foi versionado em um arquivo de exemplo. Se ele foi reutilizado em qualquer ambiente, qualquer pessoa com acesso ao repositório pode forjar JWTs, inclusive com role ADMIN."),
    ("F-02", "ALTA", COLORS["high"], "Startup aceita JWT_SECRET fraco ou conhecido", "apps/api/src/env/index.ts:7", "A validação exige apenas string; aceita vazio lógico curto, 'testing' ou o placeholder público do exemplo. Uma implantação que copie esse valor permite falsificação de tokens."),
    ("F-03", "MÉDIA", COLORS["medium"], "Restrição MEMBER de check-in existe só no frontend", "apps/web/.../discovery-island.tsx:192; apps/api/.../check-ins-routes.ts:15", "O botão é exibido apenas para MEMBER, mas o servidor exige somente JWT. Um ADMIN autenticado pode chamar POST /gyms/:gymId/check-ins diretamente."),
    ("F-04", "MÉDIA", COLORS["medium"], "PostgreSQL local publicado com credenciais previsíveis", "apps/api/docker-compose.yml:4–8", "A porta 5432 é publicada no host e as credenciais são docker/docker. Em host compartilhado ou acessível por rede, outro usuário pode autenticar e ler/alterar o banco local."),
]


def findings_table(r: Report):
    r.page("Tabela de achados")
    r.para("Somente achados demonstráveis no código foram incluídos. Condições de explorabilidade são explicitadas para evitar tratar configuração local como comprometimento de produção.", 18, width=96)
    for fid, sev, color, title, location, desc in FINDINGS:
        y = r.y
        r.d.rounded_rectangle((MARGIN, y, W-MARGIN, y+250), 18, fill=COLORS["white"], outline=COLORS["line"], width=2)
        r.d.rounded_rectangle((MARGIN+24, y+22, MARGIN+145, y+58), 18, fill=color)
        r.d.text((MARGIN+42, y+29), sev, font=font(14, True), fill=COLORS["white"])
        r.d.text((MARGIN+170, y+24), f"{fid}  {title}", font=font(20, True), fill=COLORS["ink"])
        r.d.text((MARGIN+24, y+78), location, font=font(15, mono=True), fill=COLORS["muted"])
        yy = y+116
        for line in textwrap.wrap(desc, 95, break_long_words=False):
            r.d.text((MARGIN+24, yy), line, font=font(17), fill=COLORS["ink"])
            yy += 27
        r.y += 272


def detail_pages(r: Report):
    details = [
        ("F-01 — Chave JWT pública no histórico", "ALTA", COLORS["high"], ".env.example na revisão 0427630f708bef00aa86df99fb98126bb50c8969, linha 2", '2  JWT_SECRET="[REDACTED — valor comprometido no histórico]"', "O valor completo está disponível a qualquer leitor do histórico. Como @fastify/jwt usa JWT_SECRET para verificar access e refresh tokens, reutilizar esse valor permite assinar {type: 'access', role: 'ADMIN', sub: <uuid>} e alcançar rotas administrativas.", "Explorável se esse exemplo histórico foi usado em Vercel, homologação ou produção. A auditoria não prova que o valor local/produção atual seja o mesmo; por isso é necessário confirmar e, na dúvida, rotacionar."),
        ("F-02 — Política insuficiente para JWT_SECRET", "ALTA", COLORS["high"], "apps/api/src/env/index.ts, linhas 5–9; apps/api/.env.example, linha 2", '5  const envSchema = z.object({\n6    NODE_ENV: z.enum([...]).default("dev"),\n7    JWT_SECRET: z.string(),\n8    PORT: z.coerce.number().default(3333),\n9    DATABASE_URL: z.string(),\n\n2  JWT_SECRET=replace-with-a-long-random-secret', "O processo inicia com qualquer string. O valor público do .env.example também satisfaz o schema. Quem conhecer um segredo efetivamente implantado consegue forjar o papel ADMIN, pois o papel é lido do payload assinado nas linhas 5–8 de verify-user-role.ts.", "Explorável quando a configuração usa valor curto, previsível ou copiado do exemplo. Corrigir com min(32/64), rejeição explícita de placeholders/test values em production e segredo gerado criptograficamente."),
        ("F-03 — Gate MEMBER somente na interface", "MÉDIA", COLORS["medium"], "apps/web/src/features/discovery/discovery-island.tsx, linhas 190–193; apps/api/src/http/routes/check-ins-routes.ts, linha 15", '190  <GymGrid\n191    gyms={gyms}\n192    allowCheckIn={user.role === "MEMBER"}\n193    checkIn={checkIn}\n\n15  app.post("/gyms/:gymId/check-ins", { onRequest: [verifyJWT] }, checkIn);', "A UI oculta a ação para ADMIN, mas um administrador pode enviar a mesma requisição HTTP diretamente. O controller usa req.user.sub e o serviço cria o registro sem validar role. Isso viola a separação de papéis expressa na interface e cria check-ins administrativos fora do fluxo esperado.", "Explorável por qualquer conta ADMIN com token válido, desde que envie coordenadas a até 100 m e ainda não tenha feito check-in no dia. Adicionar verifyUserRole(\"MEMBER\") à rota e teste E2E de negação para ADMIN."),
        ("F-04 — Banco local com credencial previsível", "MÉDIA", COLORS["medium"], "apps/api/docker-compose.yml, linhas 3–8", '3    image: bitnami/postgresql\n4    ports:\n5      - "5432:5432"\n6    environment:\n7      POSTGRESQL_USERNAME: docker\n8      POSTGRESQL_PASSWORD: docker', "O bind sem endereço publica 5432 nas interfaces do host. Com usuário e senha conhecidos no repositório, um processo local não confiável — ou um host alcançável pela rede, conforme firewall — pode autenticar e manipular dados do ambiente.", "Condicionado à execução do Compose em máquina compartilhada ou com 5432 acessível. Para desenvolvimento individual isolado o impacto é menor. Usar 127.0.0.1:5432:5432, credencial via .env não versionado e volume/rede dedicados."),
    ]
    for title, sev, color, location, snippet, why, condition in details:
        r.page(title)
        r.label(sev, color)
        r.heading("Evidência", 23)
        r.para(location, 16, COLORS["muted"], width=105, gap=10)
        r.code(snippet, 14)
        r.heading("Por que é explorável", 23)
        r.para(why, 18, width=96)
        r.heading("Condição de explorabilidade", 23)
        r.card("Escopo", condition, color, 180)


def coverage(r: Report):
    r.page("Cobertura e resultados negativos")
    r.heading("Inventário de rotas — 26 handlers", 25)
    groups = [
        ("Públicas / sessão (6)", "GET /, GET /health, POST /users, POST /sessions, POST /sessions/refresh, POST /sessions/logout"),
        ("Usuário autenticado (7)", "GET /me, GET /gyms, GET /gyms/search, GET /gyms/nearby, POST /gyms/:gymId/check-ins, GET /check-ins/history, GET /check-ins/metrics"),
        ("Administrador (13)", "POST /gyms; GET /gyms/deleted; PATCH/DELETE /gyms/:gymId; DELETE /gyms/deleted/permanent; DELETE /gyms/:gymId/permanent; PATCH /gyms/:gymId/restore; GET /check-ins/pending|expired|validated; GET /check-ins/metrics/global; DELETE /check-ins/expired/:checkInId; PATCH /check-ins/:checkInId/validate"),
    ]
    for title, body in groups:
        r.card(title, body, COLORS["navy"], 175 if "Administrador" not in title else 210)
    r.para("Contagem total: 6 públicas/sessão + 7 autenticadas + 13 administrativas = 26. Rotas com vários verbos foram contadas por handler registrado.", 15, COLORS["muted"], width=110)
    r.heading("Categorias sem achado confirmado", 25)
    r.card("Banco sem tranca / isolamento", "Não há tenant no modelo. Academias são globais por desenho. Histórico, métrica e perfil pessoais recebem exclusivamente req.user.sub; os repositórios aplicam user_id. Listagens com PII são administrativas.", COLORS["strong"], 180)
    r.card("IDOR", "Todos os IDs externos foram revisados. Recursos pessoais não aceitam userId do cliente. gymId/checkInId designam recursos globais e suas mutações estão protegidas por ADMIN; check-in novo vincula o usuário do JWT.", COLORS["strong"], 180)
    r.card("XSS", "Nenhum sink de HTML/JS foi encontrado. Conteúdo persistido é interpolado por JSX com escape. O único URL dinâmico é tel: e o backend restringe o telefone a dígitos/formatação conhecida.", COLORS["strong"], 180)


def recommendations(r: Report):
    r.page("Recomendações priorizadas")
    recs = [
        ("P1", COLORS["high"], "Rotacionar e invalidar segredos JWT", "Confirmar se o valor histórico foi usado em qualquer ambiente. Em caso positivo ou dúvida, trocar JWT_SECRET e revogar sessões existentes imediatamente."),
        ("P1", COLORS["high"], "Aplicar política de segredo no startup", "Exigir pelo menos 32 bytes aleatórios (preferível 64), negar placeholders e valores de teste quando NODE_ENV=production, e documentar geração segura."),
        ("P2", COLORS["medium"], "Autorizar MEMBER no endpoint de check-in", "Adicionar verifyUserRole(\"MEMBER\") e teste E2E garantindo 403 para ADMIN. Manter a UI como conveniência, não como controle."),
        ("P2", COLORS["medium"], "Restringir PostgreSQL do Compose", "Bind em 127.0.0.1, senha local fora do Git e documentação explícita de que o Compose não deve ser usado como configuração de produção."),
        ("P3", COLORS["low"], "Adicionar testes negativos de matriz de papéis", "Para cada rota administrativa, testar MEMBER→403; para cada rota exclusiva de membro, testar ADMIN→403. Automatizar a matriz para evitar regressões."),
        ("P3", COLORS["low"], "Automatizar secret scanning", "Executar detector de segredos no pre-commit/CI e bloquear novos valores de alta entropia. Revisar também bundles de produção antes do deploy."),
    ]
    for pri, color, title, body in recs:
        y = r.y
        r.d.rounded_rectangle((MARGIN, y, MARGIN+70, y+48), 12, fill=color)
        r.d.text((MARGIN+18, y+11), pri, font=font(18, True), fill=COLORS["white"])
        r.d.text((MARGIN+95, y+3), title, font=font(21, True), fill=COLORS["ink"])
        yy = y+42
        for line in textwrap.wrap(body, 91, break_long_words=False):
            r.d.text((MARGIN+95, yy), line, font=font(16), fill=COLORS["muted"])
            yy += 25
        r.y = max(y+145, yy+20)


ISSUES = [
"""--- ISSUE 1 ---
Título: [Segurança] Impedir uso de segredos JWT públicos ou fracos
Labels sugeridas: security, severity:high

Descrição do problema e explorabilidade
O histórico contém uma chave JWT pública em .env.example@0427630:2 e o schema atual aceita qualquer string em apps/api/src/env/index.ts:7. Se um ambiente reutilizar o valor histórico, o placeholder atual ou outro valor previsível, um atacante pode assinar access tokens com role ADMIN e acessar todas as rotas privilegiadas.

Evidência
.env.example@0427630:2
JWT_SECRET=\"dfheuf...BHFVCE\"

apps/api/src/env/index.ts:7
JWT_SECRET: z.string(),

Impacto
Falsificação de identidade e elevação completa para ADMIN; leitura de PII de check-ins e alteração/exclusão de academias.

Sugestão de correção
Rotacionar o segredo se houver qualquer chance de reutilização; exigir segredo aleatório com comprimento/entropia adequados; rejeitar valores conhecidos em produção; invalidar sessões antigas após rotação.

Critérios de aceite
- [ ] JWT_SECRET de produção foi rotacionado e sessões antigas invalidadas.
- [ ] Startup de produção falha com placeholder, \"testing\" e segredo curto.
- [ ] Startup aceita segredo aleatório de pelo menos 32 bytes.
- [ ] .env.example não contém valor utilizável como assinatura.
- [ ] Há testes automatizados para a validação de ambiente.
--- FIM ISSUE 1 ---""",
"""--- ISSUE 2 ---
Título: [Segurança] Validar papel MEMBER no endpoint de check-in
Labels sugeridas: security, severity:medium

Descrição do problema e explorabilidade
O frontend mostra a ação apenas quando user.role === \"MEMBER\" (discovery-island.tsx:192), mas POST /gyms/:gymId/check-ins exige somente verifyJWT (check-ins-routes.ts:15). Um ADMIN pode chamar a API diretamente e criar check-in para seu próprio sub, contornando a regra de papel da interface.

Evidência
apps/web/src/features/discovery/discovery-island.tsx:192
allowCheckIn={user.role === \"MEMBER\"}

apps/api/src/http/routes/check-ins-routes.ts:15
app.post(\"/gyms/:gymId/check-ins\", { onRequest: [verifyJWT] }, checkIn);

Impacto
Violação da separação de papéis e criação de registros administrativos fora do fluxo previsto.

Sugestão de correção
Adicionar verifyUserRole(\"MEMBER\") depois de verifyJWT e cobrir a matriz de papéis em teste E2E.

Critérios de aceite
- [ ] MEMBER autenticado continua recebendo 201 quando cumpre as regras de negócio.
- [ ] ADMIN autenticado recebe 403 no POST de check-in.
- [ ] Usuário sem JWT recebe 401.
- [ ] Existe teste E2E de regressão para ADMIN→403.
--- FIM ISSUE 2 ---""",
"""--- ISSUE 3 ---
Título: [Segurança] Restringir PostgreSQL local e remover credencial previsível
Labels sugeridas: security, severity:medium

Descrição do problema e explorabilidade
apps/api/docker-compose.yml publica 5432:5432 e define usuário/senha docker/docker. Em máquina compartilhada ou com a porta alcançável pela rede, qualquer pessoa que conheça o repositório pode autenticar no banco local.

Evidência
apps/api/docker-compose.yml:4-8
ports: [\"5432:5432\"]
POSTGRESQL_USERNAME: docker
POSTGRESQL_PASSWORD: docker

Impacto
Leitura, alteração ou exclusão de dados do ambiente local; possível apoio a ataques contra testes e desenvolvimento.

Sugestão de correção
Publicar apenas em 127.0.0.1, carregar senha de arquivo .env não versionado e documentar que o Compose é exclusivamente local.

Critérios de aceite
- [ ] A porta do PostgreSQL faz bind somente em 127.0.0.1 (ou não é publicada).
- [ ] A senha não está hardcoded no Compose.
- [ ] O projeto falha com mensagem clara quando a variável local obrigatória está ausente.
- [ ] A documentação proíbe reutilizar essa configuração em produção.
--- FIM ISSUE 3 ---""",
]


def issues(r: Report):
    for idx, issue in enumerate(ISSUES, 1):
        lines = issue.splitlines()
        page_no = 1
        r.page(f"ISSUES PARA O GITHUB — Issue {idx}")
        r.para("Texto completo em Markdown, pronto para copiar e colar.", 16, COLORS["muted"])
        for raw in lines:
            wrapped = textwrap.wrap(raw, width=105, break_long_words=False, replace_whitespace=False) or [""]
            for line in wrapped:
                if r.y > H - 115:
                    page_no += 1
                    r.page(f"ISSUES PARA O GITHUB — Issue {idx} (continuação {page_no})")
                is_delim = line.startswith("--- ISSUE") or line.startswith("--- FIM")
                r.d.text((MARGIN, r.y), line, font=font(14, bold=is_delim, mono=not is_delim), fill=COLORS["navy"] if is_delim else COLORS["ink"])
                r.y += 23
            r.y += 5


def main():
    r = Report()
    cover(r)
    methodology(r)
    summary(r)
    strengths(r)
    findings_table(r)
    detail_pages(r)
    coverage(r)
    recommendations(r)
    issues(r)
    r.finish()
    print(f"Gerado: {OUTPUT}")
    print(f"Páginas: {len(r.pages)}")


if __name__ == "__main__":
    main()
