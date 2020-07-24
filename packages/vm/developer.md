# Developer Documentation

## TESTING

### Running Tests

Tests can be found in the `tests` directory, with `FORK_CONFIG` set in `tests/tester.js`. There are test runners for [State tests](http://www.ethdocs.org/en/latest/contracts-and-transactions/ethereum-tests/state_tests/index.html) and [Blockchain tests](http://www.ethdocs.org/en/latest/contracts-and-transactions/ethereum-tests/blockchain_tests/index.html). VM tests are disabled since Frontier gas costs are not supported any more. Tests are then executed by the [ethereumjs-testing](https://github.com/ethereumjs/ethereumjs-testing) utility library using the official client-independent [Ethereum tests](https://github.com/ethereum/tests).

For a wider picture about how to use tests to implement EIPs you can have a look at this [reddit post](https://www.reddit.com/r/ethereum/comments/6kc5g3/ethereumjs_team_is_seeking_contributors/)
or the associated YouTube video introduction to [core development with Ethereumjs-vm](https://www.youtube.com/watch?v=L0BVDl6HZzk&feature=youtu.be).

#### Running different Test Types

Running the State tests:

`node ./tests/tester -s`

Running the Blockchain tests:

`node ./tests/tester -b`

State tests and Blockchain tests can also be run against the `dist` folder (default: `lib`):

`node ./tests/tester -b --dist`

State tests run significantly faster than Blockchain tests, so it is often a good choice to start fixing State tests.

#### Running Specific Tests

Running all the blockchain tests in a file:

`node ./tests/tester -b --file='randomStatetest303'`

Running tests from a specific directory:

`node ./tests/tester -b --dir='bcBlockGasLimitTest'`

Running a specific state test case:

`node ./tests/tester -s --test='stackOverflow'`

Only run test cases with selected `data`, `gas` and/or `value` values (see
[attribute description](http://ethereum-tests.readthedocs.io/en/latest/test_types/state_tests.html) in
test docs), provided by the index of the array element in the test `transaction` section:

`node tests/tester -s --test='CreateCollisionToEmpty' --data=0 --gas=1 --value=0`

Run a state test from a specified source file not under the `tests` directory:
`node ./tests/tester -s --customStateTest='{path_to_file}'`

#### Running tests with a reporter/formatter

`npm run formatTest -t [npm script name OR node command]` will pipe to `tap-spec` by default.

To pipe the results of the API tests through `tap-spec`:

`npm run formatTest -- -t testAPI`

To pipe the results of tests run with a node command through `tap-spec`:

`npm run formatTest -- -t "./tests/tester -b --dir='bcBlockGasLimitTest'"`

The `-with` flag allows the specification of a formatter of your choosing:

`npm install -g tap-mocha-reporter`
`npm run formatTest -- -t testAPI -with 'tap-mocha-reporter json'`

#### Skipping Tests

There are three types of skip lists (`BROKEN`, `PERMANENT` and `SLOW`) which
can be found in `tests/tester.js`. By default tests from all skip lists are omitted.

You can change this behaviour with:

`node tests/tester -s --skip=BROKEN,PERMANENT`

to skip only the `BROKEN` and `PERMANENT` tests and include the `SLOW` tests.
There are also the keywords `NONE` or `ALL` for convenience.

It is also possible to only run the tests from the skip lists:

`node tests/tester -s --runSkipped=SLOW`

### CI Test Integration

Tests are run on `CircleCI` on every PR, configuration can be found in `.circleci/config.yml`.

### Debugging

#### Local Debugging

For state tests you can use the `--jsontrace` flag to output opcode trace information.

Blockchain tests support `--debug` to verify the postState:

`node ./tests/tester -b --debug --test='ZeroValue_SELFDESTRUCT_ToOneStorageKey_OOGRevert_d0g0v0_EIP158'`

All/most State tests are replicated as Blockchain tests in a `GeneralStateTests` [sub directory](https://github.com/ethereum/tests/tree/develop/BlockchainTests/GeneralStateTests) in the Ethereum tests repo, so for debugging single test cases the Blockchain test version of the State test can be used.

#### Comparing Stack Traces

Other client implementations often also provide functionality for output trace information.

A convenient way is to use a local `geth` installation (can be the binary installation and doesn't has to be build from source or something) and then use the included `evm` tool like:

```shell
evm --json --nomemory statetest node_modules/ethereumjs-testing/tests/GeneralStateTests/stCreate2/create2collisionCode2.json
```

If you want to have only the output for a specific fork you can go into the referenced json test file and temporarily delete the `post` section for the non-desired fork outputs (or, more safe and also more convenient on triggering later: copy the test files you are interested in to your working directory and then modify without further worrying).

#### Debugging Tools

For comparing `EVM` traces [here](https://gist.github.com/cdetrio/41172f374ae32047a6c9e97fa9d09ad0) are some instructions for setting up `pyethereum` to generate corresponding traces for state tests.

Compare TAP output from blockchain/state tests and produces concise diff of the differences between them (example):

```
curl https://gist.githubusercontent.com/jwasinger/6cef66711b5e0787667ceb3db6bea0dc/raw/0740f03b4ce90d0955d5aba1e0c30ce698c7145a/gistfile1.txt > output-wip-byzantium.txt
curl https://gist.githubusercontent.com/jwasinger/e7004e82426ff0a7137a88d273f11819/raw/66fbd58722747ebe4f7006cee59bbe22461df8eb/gistfile1.txt > output-master.txt
python utils/diffTestOutput.py output-wip-byzantium.txt output-master.txt
```

An extremely rich and powerful toolbox is the [evmlab](https://github.com/holiman/evmlab) from `holiman`, both for debugging and creating new test cases or example data.

## Profiling

[Clinic](https://github.com/nearform/node-clinic) Allows profiling the VM in the node environment. It supports various profiling methods, among them is [flame](https://github.com/nearform/node-clinic-flame) which can be used for generating flamegraphs to highlight bottlenecks and hot paths. As an example, to generate a flamegraph for the VM blockchain tests, you can run:

```sh
NODE_OPTIONS="--max-old-space-size=4096" clinic flame -- node ./tests/tester.js -b --excludeDir='GeneralStateTests'
```
