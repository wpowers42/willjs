
// Define the HighScores class
export default class HighScores {
    scores: [string, number][];

    constructor() {
        this.scores = this.get();
    }

    public isHighScore(score: number): boolean {
        // Check if the score is higher than any of the current high scores
        return this.scores.some(([, s]) => s < score);
    }


    public submitScore(name: string, score: number): void {
        // Check if the score is higher than any of the current high scores
        const isHighScore = this.scores.some(([, s]) => s < score);

        if (isHighScore) {
            // Add the new score to the high scores list
            this.scores.push([name, score]);

            // Sort the high scores list in descending order by score
            this.scores.sort((a, b) => b[1] - a[1]);

            // Limit the high scores list to 10 items
            this.scores = this.scores.slice(0, 10);

            // Save the updated high scores list to local storage
            this.save(this.scores);
        }
    }


    // Save the high scores to local storage
    private save(scores: [string, number][]): void {
        // Convert the scores array to a JSON string
        const scoresJson = JSON.stringify(scores);
        // Save the scores to local storage
        localStorage.setItem("highScores", scoresJson);
    }

    // Retrieve the high scores from local storage
    private get(): [string, number][] {
        // Retrieve the scores from local storage
        const scoresJson = localStorage.getItem("highScores");

        let scores: [string, number][];
        if (scoresJson === null) {
            // If the scores are not found in local storage, initialize them with default values
            scores = [
                ["CTO", 1000],
                ["CTO", 2000],
                ["CTO", 3000],
                ["CTO", 4000],
                ["CTO", 5000],
                ["CTO", 6000],
                ["CTO", 7000],
                ["CTO", 8000],
                ["CTO", 9000],
                ["CTO", 10000],
            ];

            this.save(scores);
        } else {
            // Parse the scores from the JSON string
            scores = JSON.parse(scoresJson);
        }

        // Return the scores array
        return scores.sort((a, b) => b[1] - a[1]);
    }
}
