// noinspection JSUnusedGlobalSymbols
function WubiIndex() {

    return {
        inputText: '',

        onTextChanged() {
            if (!this.inputText.match(/[\u4e00-\u9fa5]+/g)) {
                return 'error';
            }
            return this.inputText === '' ? 'error' : this.inputText;
        },
    }
}

function WubiInput() {
    const whitespaceCharacters = [' ', ' ',
        '\b', '\t', '\n', '\v', '\f', '\r', `\"`, `\'`, `\\`,
        '\u0008', '\u0009', '\u000A', '\u000B', '\u000C',
        '\u000D', '\u0020', '\u0022', '\u0027', '\u005C',
        '\u00A0', '\u2028', '\u2029', '\uFEFF'];

    const stop_words = '\'"()[]{}<>.,:;!?*&^%$#@~`-_=+/\\|' +
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        '0123456789' +
        '，。“”《》——！？：、‘’';

    function isSpace(str) {
        for (const space of whitespaceCharacters) {
            if (str.indexOf(space) > -1) {
                return true;
            }
        }
        return false;
    }

    function isStopWord(str) {
        return stop_words.indexOf(str) > -1;
    }

    function moveInputBox() {
        const cursor = document.getElementById('cursor');
        const {offsetLeft, offsetTop, offsetHeight} = cursor;
        const inputBox = document.getElementById('inputBox');
        inputBox.style.top = offsetTop + offsetHeight;
        inputBox.style.left = offsetLeft + 15;
        const inputText = document.getElementById('inputText');
        inputText.focus();
    }

    return {
        target: "Loading...",
        progress: Number(localStorage.getItem("progress")) || 0,
        letter: Number(localStorage.getItem("letter")) || 0,
        inputText: '',

        showTextarea: false,
        showInputBox: true,
        isStopWord,

        getText() {
            let target = localStorage.getItem("target");
            if (target) {
                this.target = target;
                setTimeout(() => moveInputBox(), 0);
            } else {
                fetch('text/common.txt')
                    .then(response => response.text())
                    .then(text => {
                        this.target = text.trim();
                        setTimeout(() => moveInputBox(), 0);
                    });
            }
        },

        refreshText(file) {
            fetch(file)
                .then(response => response.text())
                .then(text => {
                    this.target = text.trim();
                    setTimeout(() => moveInputBox(), 0);
                    localStorage.setItem("progress", '0');
                    localStorage.setItem("letter", '0');
                    localStorage.setItem("target", text);
                    location.reload()
                });
        },

        randomText() {
            let target = localStorage.getItem("target");
            if (target) {
                const text = shuffle(Array.from(target)).join("").trim()
                this.target = text;
                setTimeout(() => moveInputBox(), 0);
                localStorage.setItem("progress", '0');
                localStorage.setItem("letter", '0');
                localStorage.setItem("target", text);
                location.reload()
            }
        },

        getTargetDone() {
            let {target, progress} = this;
            return target.substring(0, progress);
        },

        getTargetTodo() {
            let {target, progress} = this;
            return target.substring(progress);
        },

        getCharacter() {
            return this.target[this.progress];
        },

        onTextChanged() {
            let {target, progress, letter, inputText} = this;
            if (!inputText.match(/[\u4e00-\u9fa5]+/g)) {
                return;
            }

            let hasEnter = false;
            let hasSpace = false;
            let newInputText = '';
            for (let i = 0; i < inputText.length; i++) {
                const ch = inputText[i];
                if (target[progress] === ch) {
                    progress += 1;
                    letter += 1;
                } else {
                    newInputText += ch;
                }
                if ('\n' === ch) {
                    hasEnter = true;
                }
                if (isSpace(ch)) {
                    hasSpace = true;
                }
            }

            while (progress < target.length && isSpace(target[progress])) {
                progress += 1;
            }

            if (hasEnter) {
                newInputText = '';
            }
            this.progress = progress;
            this.letter = letter;
            this.inputText = newInputText;
            moveInputBox();

            if (letter >= target.replace(/\s+/g, '').trim().length) {
                this.progress += 1;
                this.getTargetDone()
                this.showInputBox = false;
                if (confirm("重置进度") === true) {
                    this.resetProgress()
                }
            }
            localStorage.setItem("progress", progress);
            localStorage.setItem("letter", letter);
            localStorage.setItem("target", target);
        },

        resetProgress() {
            this.progress = 0;
            this.letter = 0;
            this.showInputBox = true;
            this.onTextChanged();
        },
    };
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function error(obj) {
    obj.src = "cache/error.gif";
}