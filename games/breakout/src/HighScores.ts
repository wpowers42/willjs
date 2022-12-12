
// Define the HighScores class
export default class HighScores {
    scores: [string, number][];

    constructor() {
        this.scores = this.get();
    }

    // public add() {

    // }

    // Save the high scores to local storage
    public save(scores: [string, number][]): void {
        // Convert the scores array to a JSON string
        const scoresJson = JSON.stringify(scores);
        // Save the scores to local storage
        localStorage.setItem("highScores", scoresJson);
    }

    // Retrieve the high scores from local storage
    public get(): [string, number][] {
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
