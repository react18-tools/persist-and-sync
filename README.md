# PersistAndSync Zustand Store 

[![test](https://github.com/mayank1513/persist-and-sync/actions/workflows/test.yml/badge.svg)](https://github.com/mayank1513/persist-and-sync/actions/workflows/test.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/5355eb02cfedc9184e3f/maintainability)](https://codeclimate.com/github/mayank1513/persist-and-sync/maintainability) [![codecov](https://codecov.io/gh/mayank1513/persist-and-sync/graph/badge.svg)](https://codecov.io/gh/mayank1513/persist-and-sync) [![Version](https://img.shields.io/npm/v/persist-and-sync.svg?colorB=green)](https://www.npmjs.com/package/persist-and-sync) [![Downloads](https://img.jsdelivr.com/img.shields.io/npm/dt/persist-and-sync.svg)](https://www.npmjs.com/package/persist-and-sync) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/persist-and-sync)

> Zustand middleware to easily persist and sync Zustand state between tabs / windows / iframes (Same Origin)

> Motivation: Recently I got cought up in several issues working with persist miggleware and syncing tabs with zustand. This is a simple light weight middleware to persist and instantly share state between tabs or windows

- ✅ 🐙 (642 Bytes gZiped) ~ 0.5 kB size cross-tab state sharing + persistance for zustand
- ✅ Full TypeScript Support
- ✅ solid reliability in 1 writing and n reading tab-scenarios (with changing writing tab)
- ✅ Fire and forget approach of always using the latest state. Perfect for single user systems
- ✅ Share state between multiple browsing contexts

## Install

```bash
$ pnpm add persist-and-sync
# or
$ npm install persist-and-sync
# or
$ yarn add persist-and-sync
```

## Usage

Simply add the middleware while creating the store and the rest will be taken care.

```ts
import { create } from "zustand";
import { persistNSync } from "persist-and-sync";

type MyStore = {
	count: number;
	set: (n: number) => void;
};

const useStore = create<MyStore>(
	persistNSync(
		set => ({
			count: 0,
			set: n => set({ count: n }),
		}),
		{ name: "my-channel" },
	),
);
```

⚡🎉Boom! Just a couple of lines and your state perfectly syncs between tabs/windows and it is also persisted using `localStorage`!

## Advanced - ignore / filter out fields based on regExp

In several cases you might want to exclude several fields from syncing. To support this scenario, we provide a mechanism to exclude fields based on regExp. Just pass `regExpToIgnore` (optional - default -> undefined) in options object.

```ts
// to ignore fields containing a slug
persistNSync(
    set => ({
      count: 0,
      slugSomeState: 1,
      slugSomeState2: 1,
      set: n => set({ count: n }),
    }),
    { name: "my-channel", regExpToIgnore: /slug/ },
    // or regExpToIgnore: new RegExp('slug')
    // Use full power of regExp by adding `i` and `g` flags
  ),
```

For more details about regExp check out - [JS RegExp](https://www.w3schools.com/jsref/jsref_obj_regexp.asp)

### Exact match

For exactly matching a parameter/field use `/^your-field-name$/`. `^` forces match from the first caracter and similarly, `$` forces match until last character.

### Ignore multiple fields with exact match

use `regExpToIgnore: /^(field1|field2|field3)$/`

## Roadmap

- [ ] `regExpToInclude` -> once implemented, passing this parameter will sync only matching fields

### 🤩 Don't forger to start [this repo](https://github.com/mayank1513/persist-and-sync)!

Want handson course for getting started with Turborepo? Check out [React and Next.js with TypeScript](https://mayank-chaudhari.vercel.app/courses/react-and-next-js-with-typescript) and [The Game of Chess with Next.js, React and TypeScrypt](https://www.udemy.com/course/game-of-chess-with-nextjs-react-and-typescrypt/?referralCode=851A28F10B254A8523FE)

## License

Licensed as MIT open source.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
