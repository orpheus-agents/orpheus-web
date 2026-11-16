-- Disposable catalog fixture for selection and new-session admission.
INSERT INTO templates (id, template_name, agentbox_template_id, description)
VALUES ('33333333-3333-4333-8333-333333333333', 'codex', 'fixture-codex', 'Integration sandbox')
ON CONFLICT (id) DO NOTHING;

INSERT INTO llm_accounts (id, name, harness, auth_mode, active, credential_store, credential_key)
VALUES ('00000000-0000-4000-8000-000000000001', 'fixture-account', 'codex', 'account', true, 'fixture', 'fixture/auth.json')
ON CONFLICT (id) DO NOTHING;
INSERT INTO model_profiles (id, name, llm_account_id, model, description, instructions, codex, active)
VALUES ('00000000-0000-4000-8000-000000000002', 'default', '00000000-0000-4000-8000-000000000001', 'fixture-model', 'Default integration profile', '', '{}', true),
       ('00000000-0000-4000-8000-000000000003', 'account', '00000000-0000-4000-8000-000000000001', 'fixture-model', 'Account integration profile', '', '{}', true)
ON CONFLICT (id) DO NOTHING;
