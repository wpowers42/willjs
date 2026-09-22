(function exposeMathCoins(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.MathCoins = api;
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
    class MathCoinsGame {
        constructor({
            random = Math.random,
            rounds = 10,
            coinDropMs = 1000,
            feedbackDelayMs = 1100,
            coinFlowStaggerMs = 160,
            coinFlowDurationMs = 700,
        } = {}) {
            this.random = random;
            this.rounds = rounds;
            this.coinDropMs = coinDropMs;
            this.feedbackDelayMs = feedbackDelayMs;
            this.coinFlowStaggerMs = coinFlowStaggerMs;
            this.coinFlowDurationMs = coinFlowDurationMs;
            this.score = 0;
            this.round = 0;
            this.startRound();
        }

        randomInteger(min, max) {
            return Math.floor(this.random() * (max - min + 1)) + min;
        }

        startRound() {
            this.round += 1;
            this.left = this.randomInteger(0, 10);
            this.right = this.randomInteger(0, 10);
            this.answer = '';
            this.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
            this.coins = Array.from({ length: 20 }, (_, index) => index + 1);
            this.dropElapsed = 0;
            this.phase = 'playing';
            this.feedback = null;
            this.awards = [];
            this.awardElapsed = 0;
        }

        pressNumber(number) {
            if (this.phase !== 'playing' || this.answer.length >= 3) return;
            this.answer += String(number);
        }

        backspace() {
            if (this.phase !== 'playing') return;
            this.answer = this.answer.slice(0, -1);
        }

        reset() {
            this.score = 0;
            this.round = 0;
            this.startRound();
        }

        finishRound(events) {
            if (this.round === this.rounds) {
                this.phase = 'finished';
                this.feedback = null;
                events.push({ type: 'finished' });
            } else {
                this.startRound();
                events.push({ type: 'round-started' });
            }
        }

        skip() {
            if (this.phase !== 'playing') return;
            this.answer = '';
            this.phase = 'skip-feedback';
            this.feedback = {
                type: 'skip',
                answer: this.left + this.right,
                remaining: this.feedbackDelayMs,
            };
        }

        submit() {
            if (this.phase !== 'playing' || this.answer === '') return;

            const expectedAnswer = this.left + this.right;
            if (Number(this.answer) !== expectedAnswer) {
                this.score -= this.coins.length;
                this.phase = 'wrong-feedback';
                this.feedback = {
                    type: 'wrong',
                    answer: expectedAnswer,
                    lost: this.coins.length,
                    remaining: this.feedbackDelayMs,
                };
                return;
            }

            this.phase = 'awarding';
            this.awardElapsed = 0;
            this.awards = this.coins.map((value, index) => ({
                value,
                index,
                awardAt: this.coinFlowDurationMs + index * this.coinFlowStaggerMs,
                awarded: false,
            }));
            const lastAwardAt = this.awards.length > 0
                ? this.awards[this.awards.length - 1].awardAt
                : 200;
            this.awardFinishAt = lastAwardAt + 250;
            this.feedback = {
                type: 'correct',
                answer: this.answer,
                earned: this.coins.length,
                remaining: this.awardFinishAt,
            };
        }

        update(deltaMilliseconds) {
            const events = [];

            if (this.phase === 'playing' && this.coins.length > 0) {
                this.dropElapsed += deltaMilliseconds;
                while (this.dropElapsed >= this.coinDropMs && this.coins.length > 0) {
                    this.dropElapsed -= this.coinDropMs;
                    events.push({ type: 'coin-dropped', value: this.coins.pop() });
                }
            }

            if (this.phase === 'wrong-feedback' || this.phase === 'skip-feedback') {
                this.feedback.remaining -= deltaMilliseconds;
                if (this.feedback.remaining <= 0) {
                    this.finishRound(events);
                }
            } else if (this.phase === 'awarding') {
                this.awardElapsed += deltaMilliseconds;
                this.feedback.remaining = Math.max(this.awardFinishAt - this.awardElapsed, 0);

                this.awards.forEach((award) => {
                    if (!award.awarded && this.awardElapsed >= award.awardAt) {
                        award.awarded = true;
                        this.score += 1;
                        events.push({
                            type: 'coin-awarded',
                            value: 1,
                            index: award.index,
                        });
                    }
                });

                if (this.awardElapsed >= this.awardFinishAt) {
                    this.finishRound(events);
                }
            }

            return events;
        }

        getState() {
            return {
                rounds: this.rounds,
                round: this.round,
                score: this.score,
                left: this.left,
                right: this.right,
                answer: this.answer,
                keys: [...this.keys],
                coins: [...this.coins],
                dropElapsed: this.dropElapsed,
                phase: this.phase,
                feedback: this.feedback ? { ...this.feedback } : null,
                awardElapsed: this.awardElapsed,
                awards: this.awards.map((award) => ({ ...award })),
                coinDropMs: this.coinDropMs,
                coinFlowDurationMs: this.coinFlowDurationMs,
                coinFlowStaggerMs: this.coinFlowStaggerMs,
            };
        }
    }

    return { MathCoinsGame };
}));
