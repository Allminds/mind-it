describe('Reform.js', function () {
    describe('HtmlEncode', function () {
        it('Should return empty string when provided undefined', function () {
            expect(App.Reform.HtmlEncode(undefined)).toBe('');
        });

        it('Should return empty string when provided null', function () {
            expect(App.Reform.HtmlEncode(null)).toBe('');
        });

        it('Should return empty string when provided empty string', function () {
            expect(App.Reform.HtmlEncode('')).toBe('');
        });

        it('Non encoding chars', function () {
            expect(App.Reform.HtmlEncode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321 ,.")).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321 ,.');
        });

        it('Usual suspects', function () {
            expect(App.Reform.HtmlEncode("<>&\"")).toBe("&#60;&#62;&#38;&#34;");
        });

        it('Punctuation', function () {
            expect(App.Reform.HtmlEncode("`~!@#$%^&*()_+=-{}|\\][:;'/?><")).toBe("&#96;&#126;&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#95;&#43;&#61;&#45;&#123;&#125;&#124;&#92;&#93;&#91;&#58;&#59;&#39;&#47;&#63;&#62;&#60;");
        });

        it('Unicode characters to 6000', function () {
            var inputUnicodeCharacters = '',
                encodedUnicodeCharacters = '';

            for (var unicodeCharacterCounter = 127; unicodeCharacterCounter < 6000; unicodeCharacterCounter++) {
                inputUnicodeCharacters += String.fromCharCode(unicodeCharacterCounter);
                encodedUnicodeCharacters += "&#" + unicodeCharacterCounter + ';';
            }

            expect(App.Reform.HtmlEncode(inputUnicodeCharacters)).toBe(encodedUnicodeCharacters);
        });
    });

    describe('HtmlAttributeEncode', function () {
        it('Should return empty string when provided undefined', function () {
            expect(App.Reform.HtmlAttributeEncode(undefined)).toBe('');
        });

        it('Should return empty string when provided null', function () {
            expect(App.Reform.HtmlAttributeEncode(null)).toBe('');
        });

        it('Should return empty string when provided empty string', function () {
            expect(App.Reform.HtmlAttributeEncode('')).toBe('');
        });

        it('Non encoding chars', function () {
            expect(App.Reform.HtmlAttributeEncode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321")).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321');
        });

        it('Usual suspects', function () {
            expect(App.Reform.HtmlAttributeEncode("<>&\"")).toBe('&#60;&#62;&#38;&#34;');
        });

        it('Punctuation', function () {
            expect(App.Reform.HtmlAttributeEncode(" ,.`~!@#$%^&*()_+=-{}|\\][:;'/?><")).toBe('&#32;&#44;&#46;&#96;&#126;&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#95;&#43;&#61;&#45;&#123;&#125;&#124;&#92;&#93;&#91;&#58;&#59;&#39;&#47;&#63;&#62;&#60;');
        });

        it('Unicode characters to 6000', function () {
            var inputUnicodeCharacters = '',
                encodedUnicodeCharacters = '';

            for (var unicodeCharacterCounter = 127; unicodeCharacterCounter < 6000; unicodeCharacterCounter++) {
                inputUnicodeCharacters += String.fromCharCode(unicodeCharacterCounter);
                encodedUnicodeCharacters += "&#" + unicodeCharacterCounter + ';';
            }

            expect(App.Reform.HtmlAttributeEncode(inputUnicodeCharacters)).toBe(encodedUnicodeCharacters);
        });
    });

    describe('XmlEncode', function () {
        it('Should return empty string when provided undefined', function () {
            expect(App.Reform.XmlEncode(undefined)).toBe('');
        });

        it('Should return empty string when provided null', function () {
            expect(App.Reform.XmlEncode(null)).toBe('');
        });

        it('Should return empty string when provided empty string', function () {
            expect(App.Reform.XmlEncode('')).toBe('');
        });

        it('Non encoding chars', function () {
            expect(App.Reform.XmlEncode('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321 ,.')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321 ,.');
        });

        it('Usual suspects', function () {
            expect(App.Reform.XmlEncode("<>&\"")).toBe('&#60;&#62;&#38;&#34;');
        });

        it('Punctuation', function () {
            expect(App.Reform.XmlEncode("`~!@#$%^&*()_+=-{}|\\][:;'/?><")).toBe("&#96;&#126;&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#95;&#43;&#61;&#45;&#123;&#125;&#124;&#92;&#93;&#91;&#58;&#59;&#39;&#47;&#63;&#62;&#60;");
        });

        it('Unicode characters to 6000', function () {
            var inputUnicodeCharacters = '',
                encodedUnicodeCharacters = '';

            for (var unicodeCharacterCounter = 127; unicodeCharacterCounter < 6000; unicodeCharacterCounter++) {
                inputUnicodeCharacters += String.fromCharCode(unicodeCharacterCounter);
                encodedUnicodeCharacters += "&#" + unicodeCharacterCounter + ';';
            }

            expect(App.Reform.XmlEncode(inputUnicodeCharacters)).toBe(encodedUnicodeCharacters);
        });
    });

    describe('XmlAttributeEncode', function () {
        it('Should return empty string when provided undefined', function () {
            expect(App.Reform.XmlAttributeEncode(undefined)).toBe('');
        });

        it('Should return empty string when provided null', function () {
            expect(App.Reform.XmlAttributeEncode(null)).toBe('');
        });

        it('Should return empty string when provided empty string', function () {
            expect(App.Reform.XmlAttributeEncode('')).toBe('');
        });

        it('Non encoding chars', function () {
            expect(App.Reform.XmlAttributeEncode('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321');
        });

        it('Usual suspects', function () {
            expect(App.Reform.XmlAttributeEncode("<>&\"")).toBe("&#60;&#62;&#38;&#34;");
        });

        it('Punctuation', function () {
            expect(App.Reform.XmlAttributeEncode(" ,.`~!@#$%^&*()_+=-{}|\\][:;'/?><")).toBe("&#32;&#44;&#46;&#96;&#126;&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#95;&#43;&#61;&#45;&#123;&#125;&#124;&#92;&#93;&#91;&#58;&#59;&#39;&#47;&#63;&#62;&#60;");
        });

        it('Unicode characters to 6000', function () {
            var inputUnicodeCharacters = '',
                encodedUnicodeCharacters = '';

            for (var unicodeCharacterCounter = 127; unicodeCharacterCounter < 6000; unicodeCharacterCounter++) {
                inputUnicodeCharacters += String.fromCharCode(unicodeCharacterCounter);
                encodedUnicodeCharacters += "&#" + unicodeCharacterCounter + ';';
            }

            expect(App.Reform.XmlAttributeEncode(inputUnicodeCharacters)).toBe(encodedUnicodeCharacters);
        });
    });
});