import * as A from "@automerge/automerge"
import { describe, expect, it } from "vitest"
import assert from "assert"
import { generateAutomergeUrl, parseAutomergeUrl } from "../src/AutomergeUrl.js"
import { DummySubduction } from "../src/subduction.js"
import { Repo } from "../src/Repo.js"
import init, { SubductionSyncWasm } from "./pkg/subduction_sync_wasm.js"
import fs from "fs/promises"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

import { Subduction } from "@automerge/subduction_automerge"

describe("Repo subduction integration", () => {
    it("should find documents from subduction", async () => {
        const url = generateAutomergeUrl()
        const { documentId } = parseAutomergeUrl(url)
        const doc = A.from({ foo: "bar" })
        const repo = new Repo({
            subduction: new Subduction(),
        })
        const handle = await repo.find(url)
        assert.deepEqual(handle.doc().foo, "bar")
    })
})

describe("Wasm repo subduction integration", () => {
    it("should find documents from subduction", async () => {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename)
        const wasmPath = join(__dirname, "pkg", "subduction_sync_wasm_bg.wasm")
        const wasmBytes = await fs.readFile(wasmPath)
        await init(wasmBytes)

        const url = generateAutomergeUrl()
        const { documentId } = parseAutomergeUrl(url)

        const repo = new Repo({
            subduction: new SubductionSyncWasm(new Map([]), [], []),
        })
        const handle = await repo.find(url)
        await handle.whenReady()
        assert.equal(handle.doc().foo, "bar")
    })
})
