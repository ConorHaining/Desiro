workflow "Build, Test, & Deploy" {
  on = "push"
  resolves = ["Run the test suite"]
}

action "Install Dependencies" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "install"
}

action "Run the test suite" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Install Dependencies"]
  runs = "['run', 'test']"
}
