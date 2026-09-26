-- Projeto Goa: esquema inicial (v0.1)

create table if not exists aeronaves (
  id serial primary key,
  codinome text not null unique,
  matricula text not null unique,
  modelo text not null,
  tipo text not null check (tipo in ('asa_fixa', 'asa_rotativa')),
  situacao text not null default 'disponivel'
    check (situacao in ('disponivel', 'manutencao', 'indisponivel')),
  criado_em timestamptz not null default now()
);

create table if not exists pessoas (
  id serial primary key,
  nome text not null,
  posto text,
  funcoes text[] not null,
  orgao text not null default 'CBMRO' check (orgao in ('CBMRO', 'SESAU', 'OUTRO')),
  whatsapp text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists missoes (
  id serial primary key,
  numero text not null unique,
  tipo text not null,
  aeronave_id int references aeronaves(id),
  origem text,
  destino text,
  hospital text,
  previsao timestamptz,
  paciente_nome text,
  paciente_idade text,
  paciente_condicao text,
  observacoes text,
  status text not null default 'acionada'
    check (status in ('acionada', 'pronta', 'concluida', 'cancelada')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists missao_equipe (
  id serial primary key,
  missao_id int not null references missoes(id) on delete cascade,
  pessoa_id int not null references pessoas(id),
  funcao text not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'enviado', 'confirmado', 'recusou', 'substituido')),
  enviado_em timestamptz,
  respondido_em timestamptz,
  criado_em timestamptz not null default now()
);
create index if not exists missao_equipe_missao_idx on missao_equipe (missao_id);

-- Registro de tudo que acontece em cada missão; base para medir o tempo economizado
create table if not exists eventos (
  id bigserial primary key,
  missao_id int references missoes(id) on delete cascade,
  tipo text not null,
  detalhe jsonb,
  criado_em timestamptz not null default now()
);
create index if not exists eventos_missao_idx on eventos (missao_id);

insert into aeronaves (codinome, matricula, modelo, tipo) values
  ('RESGATE 01', 'PT-LMU', 'Beechcraft Baron 58', 'asa_fixa'),
  ('RESGATE 03', 'PR-PML', 'Cessna 208B Grand Caravan EX', 'asa_fixa'),
  ('RESGATE 04', 'PT-HMW', 'Helibras AS350 B Esquilo', 'asa_rotativa')
on conflict (codinome) do nothing;
