# Error diagnostics

Run, message and sandbox error panels show the API's optional `diagnostic_id`
with a copy button. The full value is plain text, without a diagnostic link.
The same panel handles both snapshots and event stream updates. Errors without
an ID show their existing message and details.

Give the ID to an operator or agent with access to the application's logs. It
correlates the public error with the internal diagnostic event; it grants no
access and does not imply that a log is still retained. Native messages and
stderr remain in internal logs and are not requested by the Web application.
