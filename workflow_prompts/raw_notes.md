- Use a scenario file
- Make it work in TDD (the 3 rules of TDD); the test inform about the behavior of the code/system; get coverage code high in 90s
- Define a spec file and implementation plan in phases and tasks; finishing each task with a nice commit (a check point)
- Make it compact and leave note for next round (new conversation) after each phase. Get a great compacting prompt and insert the note in the spec
- Have a checkpoint for your manual testing (unit testing for tasks, then manual testing for phases); don’t forget to run build
- Have a kind of project memory the AI can use, as to fight its short term memory (the context window)
- If gonna use multiple agents, organize tasks in independent (as much as possible) tracks: track A, track B…
- Implementation plan in tracks and phases
- Specification in BDD
- User stories: Given/When/Then (BDD)
- Don’t forget edge cases and proper error handling
- Make copilot act as a QA so it can verify the code, hunt for bugs (and any UI/UX issues…) “You are a QA agent. Run through the specs and verify that what we've asked to be complete is complete. Hunt for bugs, and hunt for poor UI or UX. Create extra tasks that need to be completed.”
  More about testing
- Use acceptance tests
- Have a Gherkin style (Given / When / Then), behavior driven tests
- Have the AI write unit tests based of the acceptance tests
- Make a mutation tester to find coverage holes
- Make a C.R.A.P. tool: rates every function based on cyclomatic complexity vs test coverage; drives code cleanliness and high test overheating. High crap score is bad, so you have AI reduce (“decrap”) them
- Have a dependency checker: scans through the source code finding dependencies; compares to a list of allowed and disallowed; only modify with permission
  Debugging
- make it build viewers: tools that let you see what’s going on; build the architecture of the project you can view in a browser
  Performance enhancement
- tool for instrumenting and profiling
- Find bottlenecks and fix them
  RULES OF THUMB FOR DIFFERENT TYPES OF TEST
- Aim for one end-to-end test per feature: This might be written against an HTTP API, for example. The objective is to demonstrate that the feature works, and that all the moving parts are glued together correctly.
- Write the bulk of your tests against the service layer: These edge-to-edge tests offer a good trade-off between coverage, runtime, and efficiency. Each test tends to cover one code path of a feature and use fakes for I/O. This is the place to exhaustively cover all the edge cases and the ins and outs of your business logic.
- Maintain a small core of tests written against your domain model: These tests have highly focused coverage and are more brittle, but they have the highest feedback. Don't be afraid to delete these tests if the functionality is later covered by tests at the service layer.
- Error handling counts as a feature: Ideally, your application will be structured such that all errors that bubble up to your entrypoints (e.g., Flask) are handled in the same way. This means you need to test only the happy path for each feature, and to reserve one end-to-end test for all unhappy paths (and many unhappy path unit tests, of course).
  Workflow
- An architecture agent write the Gherkin file based on user’s content
- The QA agent read the gherkin and write acceptance (e2e) tests
- The developer agent will use TDD to code and make the acceptance tests pass
- CI pipeline (with GitHub Actions): run test, check linting, build, deploy the project
