-- Disposable catalog fixture for selection and new-session admission.
INSERT INTO templates (id, template_name, agentbox_template_id, description)
VALUES ('33333333-3333-4333-8333-333333333333', 'codex', 'fixture-codex', 'Integration sandbox')
ON CONFLICT (id) DO NOTHING;
