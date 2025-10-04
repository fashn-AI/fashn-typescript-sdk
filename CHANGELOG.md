# Changelog

## 0.9.2 (2025-10-04)

Full Changelog: [v0.9.1...v0.9.2](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.9.1...v0.9.2)

### Bug Fixes

* **mcp:** fix cli argument parsing logic ([34b0c45](https://github.com/fashn-AI/fashn-typescript-sdk/commit/34b0c45a937979152c4d72dca224b7e5d8066c90))
* **mcp:** resolve a linting issue in server code ([7954c44](https://github.com/fashn-AI/fashn-typescript-sdk/commit/7954c44d3464d105530a96b6014129a903322a46))


### Chores

* **internal:** codegen related update ([1dce877](https://github.com/fashn-AI/fashn-typescript-sdk/commit/1dce877a6c9c0ee48fb4806946ecd75800f30c19))
* **internal:** ignore .eslintcache ([bc1e758](https://github.com/fashn-AI/fashn-typescript-sdk/commit/bc1e758c6448f59144d320337918f40f289fd384))
* **internal:** remove .eslintcache ([6b22c71](https://github.com/fashn-AI/fashn-typescript-sdk/commit/6b22c71a882e049d9061a86c5a96a24a09c13051))
* **internal:** version bump ([5a5ab7f](https://github.com/fashn-AI/fashn-typescript-sdk/commit/5a5ab7feec8374a3aab460b95ede41dcc2ad734b))
* **jsdoc:** fix [@link](https://github.com/link) annotations to refer only to parts of the package‘s public interface ([1c5708a](https://github.com/fashn-AI/fashn-typescript-sdk/commit/1c5708ab187e40e23385b523733d8cb6946cd8c1))
* **mcp:** allow pointing `docs_search` tool at other URLs ([d439794](https://github.com/fashn-AI/fashn-typescript-sdk/commit/d43979494228bf1fe6c2e0390fc7d171a7a41f6b))
* update lockfile ([ec3be60](https://github.com/fashn-AI/fashn-typescript-sdk/commit/ec3be60923a3cf24ad12f32b50c8cd531eb4a8df))

## 0.9.1 (2025-09-29)

Full Changelog: [v0.9.0...v0.9.1](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.9.0...v0.9.1)

### Bug Fixes

* **api:** subscribe timeout as a runtime error ([8e252e5](https://github.com/fashn-AI/fashn-typescript-sdk/commit/8e252e5204eada76388c45a5a865ac417fb7de20))


### Chores

* **internal:** fix incremental formatting in some cases ([af5da99](https://github.com/fashn-AI/fashn-typescript-sdk/commit/af5da9938580f48fe25d933d35f683063686fabf))

## 0.9.0 (2025-09-26)

Full Changelog: [v0.8.0...v0.9.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.8.0...v0.9.0)

### Features

* **api:** increase exponential backoff ([f72820f](https://github.com/fashn-AI/fashn-typescript-sdk/commit/f72820fa7af489ba6acfb39f38cc9ec774323b03))
* **mcp:** add option for including docs tools ([a05003d](https://github.com/fashn-AI/fashn-typescript-sdk/commit/a05003d6e36d058bd8a9d1da4c2de8188164c57a))


### Performance Improvements

* faster formatting ([9796edc](https://github.com/fashn-AI/fashn-typescript-sdk/commit/9796edc4acf9f1e38b73765bb776115dfb8bf668))


### Chores

* **internal:** remove deprecated `compilerOptions.baseUrl` from tsconfig.json ([3b3d8e2](https://github.com/fashn-AI/fashn-typescript-sdk/commit/3b3d8e24351176137dd7674cc19361c1b2e54af7))

## 0.8.0 (2025-09-23)

Full Changelog: [v0.7.0...v0.8.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.7.0...v0.8.0)

### Features

* max retries parameter for status polling request ([1a11d0b](https://github.com/fashn-AI/fashn-typescript-sdk/commit/1a11d0be6ffed0f89d9609752cc2a9e174e92b84))
* **mcp:** enable experimental docs search tool ([2b890a2](https://github.com/fashn-AI/fashn-typescript-sdk/commit/2b890a2843331a58d02ca29653d97dc154a30709))


### Chores

* do not install brew dependencies in ./scripts/bootstrap by default ([9d7200b](https://github.com/fashn-AI/fashn-typescript-sdk/commit/9d7200bcbf5ccc7387c9f36df4652e696564a1cd))

## 0.7.0 (2025-09-19)

Full Changelog: [v0.6.0...v0.7.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.6.0...v0.7.0)

### Features

* **api:** api update ([85ced80](https://github.com/fashn-AI/fashn-typescript-sdk/commit/85ced80fb6e14b982d0703988a72b7d97b25b9bf))
* **mcp:** add docs search tool ([3cee3bb](https://github.com/fashn-AI/fashn-typescript-sdk/commit/3cee3bbdfebfc8cb2ed14a9cff3279b5272cba4d))
* **mcp:** allow setting logging level ([0321f84](https://github.com/fashn-AI/fashn-typescript-sdk/commit/0321f84124ceefffa65e3cb6c4f6e0b862f3ccec))
* **mcp:** expose client options in `streamableHTTPApp` ([41d2004](https://github.com/fashn-AI/fashn-typescript-sdk/commit/41d2004d8f78b43a4dfdefba1019abdcada21e06))


### Bug Fixes

* **ci:** set permissions for DXT publish action ([d38f993](https://github.com/fashn-AI/fashn-typescript-sdk/commit/d38f993bed1e5b752ca18c3f9fd4a8a47be39495))
* coerce nullable values to undefined ([305c916](https://github.com/fashn-AI/fashn-typescript-sdk/commit/305c916b05420168ca7dae2b501b4a8602eaf3e2))
* **mcp:** fix query options parsing ([0281035](https://github.com/fashn-AI/fashn-typescript-sdk/commit/0281035801a7d175c0606bb408e5e6bb2d10f9c5))
* **mcp:** fix uploading dxt release assets ([76c7108](https://github.com/fashn-AI/fashn-typescript-sdk/commit/76c7108064bd8bfb8dc68bcbff3d11ad472b8d67))
* **mcp:** update dxt manifest.json files ([63c366c](https://github.com/fashn-AI/fashn-typescript-sdk/commit/63c366c01f8bbca01c35608f61ce1e4b5aaa142c))


### Chores

* ci build action ([03a4a93](https://github.com/fashn-AI/fashn-typescript-sdk/commit/03a4a93b63607063b92969364823ed4b36f751c9))
* **codegen:** internal codegen update ([cd57ddf](https://github.com/fashn-AI/fashn-typescript-sdk/commit/cd57ddf16efb7d94add8603827cded210a742fdf))
* **internal:** codegen related update ([3ec8b52](https://github.com/fashn-AI/fashn-typescript-sdk/commit/3ec8b529814f53a4d1101180ebee16bc89471736))
* **internal:** codegen related update ([590b581](https://github.com/fashn-AI/fashn-typescript-sdk/commit/590b581ad0fec61d32689e27ec8639e407026e62))
* **internal:** gitignore .mcpb files ([7481446](https://github.com/fashn-AI/fashn-typescript-sdk/commit/74814460327f7869d2ee50a7736e84533c819624))
* **mcp:** rename dxt to mcpb ([67e4c40](https://github.com/fashn-AI/fashn-typescript-sdk/commit/67e4c401dd7470156ceaccd7f63838ad063e59b8))
* **mcp:** upload dxt as release asset ([4bb1b19](https://github.com/fashn-AI/fashn-typescript-sdk/commit/4bb1b190675d46c5b1217966ace4f81f90e97af5))

## 0.6.0 (2025-09-02)

Full Changelog: [v0.5.3...v0.6.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.5.3...v0.6.0)

### Features

* **api:** api update ([ff10d58](https://github.com/fashn-AI/fashn-typescript-sdk/commit/ff10d58e62dde5658b3df00545a249e2ae58b50c))

## 0.5.3 (2025-08-30)

Full Changelog: [v0.5.2...v0.5.3](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.5.2...v0.5.3)

### Bug Fixes

* **subscribe:** subscribe should not return all /status status types ([154b6e6](https://github.com/fashn-AI/fashn-typescript-sdk/commit/154b6e6a015bd3f3a2286d69764a0386dfd8576a))


### Chores

* **internal:** update global Error reference ([2d7c9f4](https://github.com/fashn-AI/fashn-typescript-sdk/commit/2d7c9f4417f7c0de9944f19ac925ccf17f4daa6c))

## 0.5.2 (2025-08-25)

Full Changelog: [v0.5.1...v0.5.2](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.5.1...v0.5.2)

### Chores

* **internal:** codegen related update ([18cf9ab](https://github.com/fashn-AI/fashn-typescript-sdk/commit/18cf9abfd2de5577bb77d1e905eea203f4a41d2a))
* update CI script ([2cd5673](https://github.com/fashn-AI/fashn-typescript-sdk/commit/2cd567390ee66b719f7b5be7831de459aff514bc))


### Documentation

* **readme:** fix company name ([91bfa9b](https://github.com/fashn-AI/fashn-typescript-sdk/commit/91bfa9b54eaa854f9f3c17a05ab28e3505512d3e))

## 0.5.1 (2025-08-23)

Full Changelog: [v0.5.0...v0.5.1](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.5.0...v0.5.1)

### Documentation

* **readme:** use subscribe examples on readme ([66db54b](https://github.com/fashn-AI/fashn-typescript-sdk/commit/66db54b40e9ba263da73d511199dfbaf13329bd1))

## 0.5.0 (2025-08-23)

Full Changelog: [v0.4.3...v0.5.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.4.3...v0.5.0)

### Features

* **prediction:** Subscribe types ([daadd59](https://github.com/fashn-AI/fashn-typescript-sdk/commit/daadd59e5fc056d920bdac9f008e04cdc18adbab))


### Bug Fixes

* **prediction:** subscription type name ([f30b220](https://github.com/fashn-AI/fashn-typescript-sdk/commit/f30b220f388ae92ff7bf78e8f33ff0c0f7b681ac))

## 0.4.3 (2025-08-23)

Full Changelog: [v0.4.2...v0.4.3](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.4.2...v0.4.3)

### Documentation

* **readme:** testing CI/CD ([8848880](https://github.com/fashn-AI/fashn-typescript-sdk/commit/8848880530436aa184dc694e383f0d14327699c0))

## 0.4.2 (2025-08-22)

Full Changelog: [v0.4.1...v0.4.2](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.4.1...v0.4.2)

### Chores

* sync repo ([d50c1e4](https://github.com/fashn-AI/fashn-typescript-sdk/commit/d50c1e48852137d1140088c5ea3c72ac8c8121ad))

## 0.4.1 (2025-08-22)

Full Changelog: [v0.4.0...v0.4.1](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.4.0...v0.4.1)

### Chores

* sync repo ([9bc063c](https://github.com/fashn-AI/fashn-typescript-sdk/commit/9bc063c4fd3996b872741b4dbe8cca011a8f1582))

## 0.4.0 (2025-08-22)

Full Changelog: [v0.3.0...v0.4.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.3.0...v0.4.0)

### Features

* **predictions:** add subscribe method for predition + polling ([e10a8d2](https://github.com/fashn-AI/fashn-typescript-sdk/commit/e10a8d261e7913172d541dd50f7da10d4c4aed87))

## 0.3.0 (2025-08-22)

Full Changelog: [v0.2.1...v0.3.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.2.1...v0.3.0)

### Features

* **api:** MCP Server ([e4704a9](https://github.com/fashn-AI/fashn-typescript-sdk/commit/e4704a9dcdaec07b53ecf8f4cc7e96a69cfef8b9))

## 0.2.1 (2025-08-22)

Full Changelog: [v0.2.0...v0.2.1](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.2.0...v0.2.1)

### Chores

* add package to package.json ([5fb67a3](https://github.com/fashn-AI/fashn-typescript-sdk/commit/5fb67a3b2b1377e45825dcf6099bb76f82910350))
* **client:** qualify global Blob ([ad919d3](https://github.com/fashn-AI/fashn-typescript-sdk/commit/ad919d3086be01578cb5da6283da4e3b68e7108e))


### Documentation

* add logo and docs/instructions ([acdcac7](https://github.com/fashn-AI/fashn-typescript-sdk/commit/acdcac7ef00ce7d804bc241025240ae0e494e846))

## 0.2.0 (2025-08-20)

Full Changelog: [v0.1.0...v0.2.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.1.0...v0.2.0)

### Features

* **api:** manual updates ([81cf0cc](https://github.com/fashn-AI/fashn-typescript-sdk/commit/81cf0ccd6c73ca523d5cc849634ff8a7b7d824b2))
* **mcp:** add code execution tool ([50405a9](https://github.com/fashn-AI/fashn-typescript-sdk/commit/50405a99c323cd0c69480fa8f2b542bb82b0c4fd))

## 0.1.0 (2025-08-19)

Full Changelog: [v0.0.1...v0.1.0](https://github.com/fashn-AI/fashn-typescript-sdk/compare/v0.0.1...v0.1.0)

### Features

* **api:** update via SDK Studio ([885f377](https://github.com/fashn-AI/fashn-typescript-sdk/commit/885f37795e78de9e9aae39cea4b3b2a20d37543e))
* **api:** update via SDK Studio ([be41891](https://github.com/fashn-AI/fashn-typescript-sdk/commit/be418916eea312c74cba811a4726744a9e06f437))
* **api:** update via SDK Studio ([41947ee](https://github.com/fashn-AI/fashn-typescript-sdk/commit/41947eef72db0efe02e00524146f10ad1b1e7598))
* **api:** update via SDK Studio ([589f6e6](https://github.com/fashn-AI/fashn-typescript-sdk/commit/589f6e640e682e05f75ea6eae4f2022b6e088a32))
* **api:** update via SDK Studio ([27f9c18](https://github.com/fashn-AI/fashn-typescript-sdk/commit/27f9c18e1489639754690c4ed7c35d7fbf15fe51))
* **api:** update via SDK Studio ([276aef7](https://github.com/fashn-AI/fashn-typescript-sdk/commit/276aef74b1408e607a8eadb802eec282bf9c0554))
* **api:** update via SDK Studio ([1f40776](https://github.com/fashn-AI/fashn-typescript-sdk/commit/1f407764d51a26b63e0f5fa4aed08a611203a8e3))
* **api:** update via SDK Studio ([6dc726c](https://github.com/fashn-AI/fashn-typescript-sdk/commit/6dc726cb1daba6cddc98e58a1a865a91d63041ef))


### Chores

* update SDK settings ([77e30e4](https://github.com/fashn-AI/fashn-typescript-sdk/commit/77e30e41f320f9fe2f82e18a2800ccc083b62afc))
