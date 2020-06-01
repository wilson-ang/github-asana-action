const action = require('./action');
const core = require('@actions/core');
const github = require('@actions/github');

describe('asana github actions', () => {
  let inputs = {};
  const defaultBody = 'Implement https://app.asana.com/0/1178251625498057/1178251625498064 in record time';
  const asanaPAT = process.env['ASANA_PAT'];
  if(!asanaPAT) {
    throw new Error('need ASANA_PAT in the test env');
  }

  const commentId = Date.now().toString();

  beforeAll(() => {
      // Mock getInput
      jest.spyOn(core, 'getInput').mockImplementation((name, options) => {
        if(inputs[name] === undefined && options && options.required){
          throw new Error(name + " was not expected to be empty");
        }
        return inputs[name]
      })
  
      // Mock error/warning/info/debug
      jest.spyOn(core, 'error').mockImplementation(jest.fn())
      jest.spyOn(core, 'warning').mockImplementation(jest.fn())
      jest.spyOn(core, 'info').mockImplementation(jest.fn())
      jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  
      github.context.ref = 'refs/heads/some-ref'
      github.context.sha = '1234567890123456789012345678901234567890'
  
      process.env['GITHUB_REPOSITORY'] = 'a-cool-owner/a-cool-repo'
    })
  
    beforeEach(() => {
      // Reset inputs
      inputs = {}
      github.context.payload = {};
    })

    test('asserting a links presence', async () => {
      inputs = {
        'asana-pat': asanaPAT,
        'action': 'assert-link',
        'github-token': 'fake'
      }
      github.context.payload = {
        pull_request: {
          'body': defaultBody,
          'head': {
            'sha': '1234567890123456789012345678901234567890'
          }
        }
      };

      const mockCreateStatus = jest.fn()
      github.GitHub = jest.fn().mockImplementation(() => {
        return {
          repos: {
            createStatus: mockCreateStatus,
          }
        }
      });

      await action();

      expect(mockCreateStatus).toHaveBeenCalledWith({
        owner: 'a-cool-owner',
        repo: 'a-cool-repo',
        context: 'asana-link-presence',
        state: 'success',
        description: 'asana link not found',
        sha: '1234567890123456789012345678901234567890',
      });
    });

    test('creating a comment', async () => {
      inputs = {
        'asana-pat': asanaPAT,
        'action': 'add-comment',
        'comment-id': commentId,
        'text': 'rad stuff',
        'is-pinned': 'true'
      }
      // Mock github context
      github.context.payload = {
        pull_request: {
          'body': defaultBody
        }
      };

      await expect(action()).resolves.toHaveLength(1);

      // rerunning with the same comment-Id should not create a new comment
      await expect(action()).resolves.toHaveLength(0);
    });

    test('removing a comment', async () => {
      inputs = {
        'asana-pat': asanaPAT,
        'action': 'remove-comment',
        // note: relies on the task being created in `creating a comment` test
        'comment-id': commentId,
      }
      github.context.payload = {
        pull_request: {
          'body': defaultBody
        }
      };

      await expect(action()).resolves.toHaveLength(1);
    });

    test('moving sections', async () => {
      inputs = {
        'asana-pat': asanaPAT,
        'action': 'move-section',
        'targets': '[{"project": "Asana bot test environment", "section": "Done"}]'
      }
      github.context.payload = {
        pull_request: {
          'body': defaultBody
        }
      };

      await expect(action()).resolves.toHaveLength(1);

      inputs = {
        'asana-pat': asanaPAT,
        'action': 'move-section',
        'targets': '[{"project": "Asana bot test environment", "section": "New"}]'
      }

      await expect(action()).resolves.toHaveLength(1);
    });
});