import { PartBuilder } from "./mail_parts";

export class MailBuilder {
    private root_part: PartBuilder;

    constructor(initial_part?: PartBuilder) {
        this.root_part = initial_part ?? PartBuilder.create_text_part();
        this.root_part.headers["MIME-Version"] = "1.0";
    }

    public set_sender(sender: string): this {
        return this.set_top_level_header("From", sender);
    }

    public set_receiver(receiver: string): this {
        return this.set_top_level_header("To", receiver);
    }

    public set_subject(subject: string): this {
        return this.set_top_level_header("Subject", subject);
    }

    public set_top_level_header(key: string, value: string): this {
        this.root_part.headers[key] = value;
        return this;
    }

    public to_string(i?: number): string {
        return PartBuilder.parts_to_string([this.root_part], i ?? 0);
    }
}
