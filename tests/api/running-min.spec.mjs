import { expect, test, describe } from "bun:test"
import { ZonedDateTime } from "temporal-luxon"

import { RunningMin as Subject } from "../../public/scripts/api/running-min.mjs"

const DK_TIMEZONE = "Europe/Copenhagen"

describe(Subject.name, () => {
	describe("ctor", () => {
		describe("default", () => {
			test("original props", () => {
				const subject = new Subject()

				expect(subject.min).toBe(-Infinity)
				expect(subject.ts).toBe(undefined)
			})
		})

		describe("values", () => {
			test("initialized props", () => {
				const min = 1
				const ts = ZonedDateTime.from({
					year: 2026,
					month: 6,
					day: 4,
					timeZone: DK_TIMEZONE
				})
				const subject = new Subject(min, ts)

				expect(subject.min).toBe(min)
				expect(subject.ts).toBe(ts)
			})
		})
	})
	describe("process()", () => {
		describe("first", () => {
			test("args are the min", () => {
				const min = 1
				const ts = ZonedDateTime.from({
					year: 2026,
					month: 6,
					day: 4,
					timeZone: DK_TIMEZONE
				})
				const subject = new Subject()

				subject.process(min, ts)

				expect(subject.min).toBe(min)
				expect(subject.ts).toBe(ts)
			})
		})

		describe("next", () => {
			describe("bigger value", () => {
				test("min not replaced", () => {
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

					expect(subject.min).not.toBe(bigger)
					expect(subject.ts).not.toBe(nextTs)

					expect(subject.min).toBe(1)
					expect(subject.ts).toBe(ts)
				})
			})

			describe("same value", () => {
				test("min not replaced", () => {
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

					expect(subject.min).toBe(same)
					expect(subject.ts).not.toBe(nextTs)

					expect(subject.ts).toBe(ts)
				})
			})

			describe("smaller value", () => {
				test("min replaced", () => {
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

					expect(subject.min).toBe(smaller)
					expect(subject.ts).toBe(nextTs)
				})
			})
		})
	})
})
