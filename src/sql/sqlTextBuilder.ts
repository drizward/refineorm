
export class SqlTextBuilder {

    private readonly afterFinish: (() => any)[] = [];
    private arrStr: string[] = [];
    private cursor: number = 0;
    
    public baseIndent = 0;

    get length(): number {
        return this.arrStr.length
    }

    appendText(text: string): SqlTextBuilder {
        if(!this.arrStr.length)
            this.arrStr.push('');

        this.arrStr[this.cursor] += text;
        return this;
    }

    prependText(text: string): SqlTextBuilder {
        if(!this.arrStr.length)
            this.arrStr.push('');

        const pre = this.arrStr[this.cursor];
        this.arrStr[this.cursor] = text+pre;
        return this;
    }

    moveCursor(line: number): SqlTextBuilder {
        this.cursor = line;
        return this;
    }

    appendLine(after?: number): SqlTextBuilder {   
        this.cursor = (after || this.cursor) + 1;
        this.arrStr.splice(this.cursor, 0, '');

        for(let i = 0; i < this.baseIndent; i++)
            this.appendIndent();
            
        return this;
    }

    prependLine(before?: number): SqlTextBuilder {
        this.cursor = (before || this.cursor) - 1;
        this.arrStr.splice(this.cursor, 0, '');
        return this;
    }

    appendIndent(): SqlTextBuilder {
        this.appendText('    ');
        return this;
    }

    appendWhitespace(): SqlTextBuilder {
        this.appendText(' ');
        return this;
    }

    replace(from: string | RegExp, to: string) {
        this.arrStr[this.cursor] = this.arrStr[this.cursor].replace(from, to);
    }

    finish(): string {
        this.afterFinish.forEach(x => x());
        return this.arrStr.join('\n');
    }

}