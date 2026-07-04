import { expect, test, describe } from "bun:test"

import { RunningAvg as Subject } from "../../public/scripts/api/running-avg.mjs"

describe(Subject.name, () => {
	describe("ctor", () => {
		describe("default", () => {
			test("undefined", () => {
				const subject = new Subject()

				expect(subject.avg).toBe(undefined)
			})
		})

		describe("values", () => {
			test("initialized", () => {
				const avg = 2
				const count = 1

				const subject = new Subject(avg, count)

				expect(subject.avg).toBe(avg)
			})
		})
	})
	describe("process()", () => {
		describe("first", () => {
			test("args are the min", () => {
				const avg = 2

				const subject = new Subject()

				subject.process(avg)

				expect(subject.avg).toBe(avg)
			})
		})

		describe("next", () => {
			describe("I have none", ()=> {
				describe("you have two", ()=> {
					test("we are supposed to have one each", ()=> {
						const subject = new Subject(0, 1) // I have none

						subject.process(2) // you have two

						expect(subject.avg).toBe(1) // aren't we supposed to have one each?
					})
				})
			})
		})
	})
})
