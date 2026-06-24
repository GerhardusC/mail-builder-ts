export type MultiPartKind = "alternative" | "mixed";

export type PartBuilder = {
    data: TextPart | MultiPart;
    headers: {
        [index: string]: string;
    };
    parent?: PartBuilder | undefined;
};

export type TextPart = {
    part_kind: "plain_text" | "html";
    content: string;
};

export type MultiPart = {
    part_kind: "multipart";
    multipart_kind: MultiPartKind;
    children: PartBuilder[];
};

export const PartBuilder = {
    parts_to_string(parts: PartBuilder[], boundary: number): string {
        return parts
            .map((part) => {
                switch (part.data.part_kind) {
                    case "plain_text":
                    case "html":
                        return PartBuilder.format_text_part(part, boundary);
                    case "multipart":
                        let inner_boundary = boundary + 1;
                        part.headers["Content-Type"] =
                            `multipart/${part.data.multipart_kind}; boundary="====${inner_boundary}=="`;
                        let headers_str = Object.keys(part.headers)
                            .map((key) => {
                                return `${key}: ${part.headers[key]}`;
                            })
                            .join("\r\n");
                        return `${headers_str}\r\n\r\n${PartBuilder.parts_to_string(
                            part.data.children,
                            inner_boundary,
                        )}--====${inner_boundary}==--\r\n`;
                }
            })
            .join("\r\n");
    },

    format_text_part(part: PartBuilder, boundary: number): string {
        if (
            part.data.part_kind !== "plain_text" &&
            part.data.part_kind !== "html"
        ) {
            // TODO: Handle invalid parts properly
            return "";
        }

        const headers_str = Object.keys(part.headers)
            .map((key) => {
                return `${key}: ${part.headers[key]}`;
            })
            .join("\r\n");

        let base_str = `${headers_str}\r\n\r\n${part.data.content}\r\n`;
        if(part.parent && part.parent.data.part_kind === "multipart") {
            return `--====${boundary}==\r\n${base_str}`;
        }
        return base_str;
    },

    create_text_part(content?: string): PartBuilder {
        return {
            headers: {
                "Content-Type": "text/plain",
            },
            data: {
                part_kind: "plain_text",
                content: content ?? "<EMPTY MAIL>",
            },
        };
    },

    create_html_part(content?: string): PartBuilder {
        return {
            headers: {
                "Content-Type": "text/html",
            },
            data: {
                part_kind: "html",
                content: content ?? "<div>EMPTY MAIL</div>",
            },
        };
    },

    create_multi_part(
        kind: MultiPartKind,
        children?: PartBuilder[],
    ): PartBuilder {
        return {
            headers: {},
            data: {
                part_kind: "multipart",
                multipart_kind: kind,
                children: children ?? [],
            },
        };
    },

    append_part(parent: PartBuilder, new_child: PartBuilder): PartBuilder {
        if (parent.data.part_kind !== "multipart") {
            const new_part = PartBuilder.create_multi_part("mixed", [parent, new_child]);
            // Haha, javascript is so funny... We have pass by reference here, so parent and child actually get updated correctly.
            parent.parent = new_part;
            new_child.parent = new_part;
            return new_part;
        }

        new_child.parent = parent;
        parent.data.children.push(new_child);
        return parent;
    },

    set_header(part: PartBuilder, key: string, value: string) {
        part.headers[key] = value;
    }
} as const;
