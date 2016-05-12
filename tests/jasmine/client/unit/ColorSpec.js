fdescribe("Tests for colors of online user position indicators in Mindmap nodes", function () {
    it("Should return color for first online user.", function () {
        var sequenceNumberOfFirstOnlineUser = 0;
        var expectedColorCode = "#d82735";

        var actualColorCode = Color.getColorCode(sequenceNumberOfFirstOnlineUser);

        expect(expectedColorCode).toBe(actualColorCode);
    });

    it("Should return color for second online user.", function () {
        var sequenceNumberOfSecondOnlineUser = 1;
        var expectedColorCode = "#009e47";

        var actualColorCode = Color.getColorCode(sequenceNumberOfSecondOnlineUser);

        expect(expectedColorCode).toBe(actualColorCode);
    });

    it("Should return color for tenth online user.", function () {
        var sequenceNumberOfTenthOnlineUser = 2;
        var expectedColorCode = "#d82735";

        var actualColorCode = Color.getColorCode(sequenceNumberOfTenthOnlineUser);

        expect(expectedColorCode).toBe(actualColorCode);
    });
});