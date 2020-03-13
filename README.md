
# Github-Asana action

This action integrates asana with github.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with.
- Must provide the task url in the PR description.

## Inputs

### `asana-pat`

**Required** Your public access token of asana, you can generate one [here](https://app.asana.com/0/developer-console).

### `github-token`

**Required** A github auth token (used to set statuses)

### `trigger-phrase`

**Optional** Prefix before the task i.e ASANA TASK: https://app.asana.com/1/2/3/.

### `task-comment`

**Optional** If any comment is provided, the action will add a comment to the specified asana task with the text & pull request link.

### `targets`

**Optional** JSON array of objects having project and section where to move current task. Move task only if it exists in target project. e.g 
```yaml
targets: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```
if you don't want to move task omit `targets`.

### `link-required`

**Optional** When set to true will fail pull requests without an asana link

## Example usage

```yaml
name: Mark asana task as done

on:
  pull_request:
    types: [closed]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: everphone-gmbh/github-asana-action@v3.0.0
        if: github.event.pull_request.merged
        with:
          asana-pat: ${{ secrets.ASANA_PAT }}
          targets: '[{"project": "Engineering scrum", "section": "Done"}]'
          link-required: false
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

```yaml
name: Add asana link

on:
  pull_request:
    types: [opened, edited, labeled, unlabeled]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: everphone-gmbh/github-asana-action@v3.0.0
        with:
          asana-pat: ${{ secrets.ASANA_PAT }}
          task-comment: 'View Pull Request Here: '
          # if the branch is labeled or named a hotfix, skip this check
          link-required: ${{ !contains(github.event.pull_request.labels.*.name, 'hotfix') && !startsWith(github.event.pull_request.title,'hotfix/') }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

```