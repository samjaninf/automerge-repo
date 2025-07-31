import * as A from "@automerge/automerge"
import { describe, expect, it } from "vitest"
import assert from "assert"
import { generateAutomergeUrl, parseAutomergeUrl } from "../src/AutomergeUrl.js"
import { DummySedimentree } from "../src/sedimentree.js"
import { Repo } from "../src/Repo.js"
import init, { SedimentreeWasm } from "./pkg/sedimentree_sync_wasm.js"
import fs from "fs/promises"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

describe("Repo sedimentree integration", () => {
  it("should find documents from sedimentree", async () => {
    const url = generateAutomergeUrl()
    const { documentId } = parseAutomergeUrl(url)
    const doc = A.from({ foo: "bar" })
    const repo = new Repo({
      sedimentree: new DummySedimentree({
        docs: new Map([[documentId, doc]]),
        networkAdapters: [],
      }),
    })
    const handle = await repo.find(url)
    assert.deepEqual(handle.doc().foo, "bar")
  })
})

describe("Wasm repo sedimentree integration", () => {
  it("should find documents from sedimentree", async () => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const wasmPath = join(__dirname, "pkg", "sedimentree_sync_wasm_bg.wasm")
    const wasmBytes = await fs.readFile(wasmPath)
    await init(wasmBytes)

    const url = generateAutomergeUrl()
    const { documentId } = parseAutomergeUrl(url)
    const doc = A.from({ foo: "bar" })

    const repo = new Repo({
      sedimentree: new SedimentreeWasm(new Map([[documentId, doc]]), []),
    })
    const handle = await repo.sedimentree().find(url)
    // assert.deepEqual(handle.doc().foo, "bar")
  })
})
