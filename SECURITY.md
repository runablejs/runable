# Security Policy

Runable takes the security of its framework, tooling, and users seriously.
If you discover a vulnerability, please report it privately so it can be
investigated before details become public.

## Supported versions

Runable is currently in alpha and evolves quickly. Security fixes are applied
to the latest published version only.

| Version | Supported |
| --- | --- |
| Latest alpha release | Yes |
| Older alpha releases | No |

Update to the latest version before reporting an issue that may already have
been fixed.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/runablejs/runable/security/advisories/new)
to submit a report securely.

Do not disclose the vulnerability in a public GitHub issue, discussion, pull
request, social media post, or community channel before a fix is available.

Include as much of the following information as possible:

- The affected Runable package and version.
- The server runtime and adapter in use.
- A clear description of the vulnerability and its impact.
- The steps required to reproduce it.
- A minimal reproduction or proof of concept.
- Any known workarounds or suggested fixes.
- Whether the vulnerability has been disclosed elsewhere.

Please remove secrets, access tokens, personal data, and production
credentials from every reproduction you share.

## What happens next

After receiving a report, the maintainers will:

1. Confirm receipt and review the supplied information.
2. Reproduce the issue and assess its scope and severity.
3. Prepare and test a fix when the report is confirmed.
4. Coordinate the release and public disclosure with the reporter.

Response and remediation times depend on the vulnerability's complexity and
impact. Updates will be shared through the private advisory while the report
is being handled.

## Scope

This policy covers vulnerabilities in the source code maintained in this
repository, including:

- `runable`
- `@runablejs/cli`
- `create-runable`
- Official runtime adapters shipped with Runable

Vulnerabilities in third-party dependencies should normally be reported to
their maintainers. If a dependency creates a security issue specifically
through its use in Runable, report it here as well.

The following are not security vulnerabilities by themselves:

- General bugs without a security impact.
- Vulnerabilities that require an already-compromised development machine.
- Problems in unsupported or modified versions of Runable.
- Issues in applications built with Runable that are caused by application
  code or deployment configuration.

Report regular bugs through the
[public issue tracker](https://github.com/runablejs/runable/issues).

## Safe harbor

Good-faith security research is welcome. Avoid accessing, modifying, or
deleting data that does not belong to you, disrupting services, degrading the
experience of other users, or using a vulnerability beyond what is necessary
to demonstrate its impact.

The project will not pursue action against researchers who follow this policy,
respect applicable laws, and give the maintainers reasonable time to address a
confirmed vulnerability before publishing details.

Thank you for helping keep Runable and its users safe.
