import { expect, test, describe } from "bun:test"
import { ZonedDateTime } from "temporal-luxon"

import { RunningMax as Subject } from "../../public/scripts/api/running-max.mjs"

const DK_TIMEZONE = "Europe/Copenhagen"

describe(Subject.name, () => {
	describe("ctor", () => {
		describe("default", () => {
			test("original props", () => {
				const subject = new Subject()

				expect(subject.max).toBe(Infinity)
				expect(subject.ts).toBe(undefined)
			})
		})

		describe("values", () => {
			test("initialized props", () => {
				const max = 1
				const ts = ZonedDateTime.from({
					year: 2026,
					month: 6,
					day: 4,
					timeZone: DK_TIMEZONE
				})
				const subject = new Subject(max, ts)

				expect(subject.max).toBe(max)
				expect(subject.ts).toBe(ts)
			})
		})
	})
	describe("process()", () => {
		describe("first", () => {
			test("args are the max", () => {
				const max = 1
				const ts = ZonedDateTime.from({
					year: 2026,
					month: 6,
					day: 4,
					timeZone: DK_TIMEZONE
				})
				const subject = new Subject()

				subject.process(max, ts)

				expect(subject.max).toBe(max)
				expect(subject.ts).toBe(ts)
			})
		})

		describe("next", () => {

			describe("smaller value", () => {
				test("max not replaced", () => {
					const ts = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 4,
						timeZone: DK_TIMEZONE
					})
					const smaller = -1
					const nextTs = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 5,
						timeZone: DK_TIMEZONE
					})
					const subject = new Subject(1, ts)

					subject.process(smaller, nextTs)

					expect(subject.max).not.toBe(smaller)
					expect(subject.ts).not.toBe(nextTs)

					expect(subject.max).toBe(1)
					expect(subject.ts).toBe(ts)
				})
			})


			describe("same value", () => {
				test("max not replaced", () => {
					const ts = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 4,
						timeZone: DK_TIMEZONE
					})
					const same = 1
					const nextTs = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 5,
						timeZone: DK_TIMEZONE
					})
					const subject = new Subject(1, ts)

					subject.process(same, nextTs)

					expect(subject.max).toBe(same)
					expect(subject.ts).not.toBe(nextTs)

					expect(subject.ts).toBe(ts)
				})
			})

			describe("bigger value", () => {
				test("max replaced", () => {
					const ts = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 4,
						timeZone: DK_TIMEZONE
					})
					const bigger = 2
					const nextTs = ZonedDateTime.from({
						year: 2026,
						month: 6,
						day: 5,
						timeZone: DK_TIMEZONE
					})
					const subject = new Subject(1, ts)

					subject.process(bigger, nextTs)

					expect(subject.max).toBe(bigger)
					expect(subject.ts).toBe(nextTs)
				})
			})


		})
	})
})
