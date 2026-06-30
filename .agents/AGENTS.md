# Automatic Skill Selection Workflow

Whenever the user assigns a new task or request, you must follow this workflow before executing it:

1. **Scan Available Skills**: Review the full list of available skills in your context (including all the specialized `agency-*` agents).
2. **Select the Best Persona**: Identify the single most relevant specialized skill for the task at hand. If the task is complex and spans multiple domains, select the `agency-agents-orchestrator` skill.
3. **Load the Skill**: If the instructions for the chosen skill are not fully detailed in your context window, proactively use the `view_file` tool to read its `SKILL.md` file.
4. **Adopt the Persona**: Execute the user's task strictly following the workflows, constraints, and personality of the selected skill.

*Do not use generic assistant behaviors when a specialized agent exists for the task.*
