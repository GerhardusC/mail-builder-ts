import { MailBuilder } from "./mail_builder";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PartBuilder } from "./mail_parts";

test("It can initialise test mail builder", () => {
    let root_part = PartBuilder.create_multi_part("alternative");
    PartBuilder.append_part(
        root_part,
        PartBuilder.create_text_part("HELLO!"),
    );
    PartBuilder.append_part(
        root_part,
        PartBuilder.create_html_part("<div>HELLO!</div>"),
    );

    let mail_builder = new MailBuilder(root_part)
        .set_sender("some.receiver@email.com")
        .set_receiver("stefan@gmail.com");

    assert.ok(mail_builder.to_string().includes("From: some.receiver@email.com"));
});

test("It can build simple single part mail", () => {
    let root_part = PartBuilder.create_text_part("This is the body of the mail.");

    let mail_builder = new MailBuilder(root_part)
        .set_sender("some.receiver@email.com")
        .set_receiver("stefan@gmail.com");

    assert.equal(
        mail_builder.to_string(),
        "Content-Type: text/plain\r\n" +
        "MIME-Version: 1.0\r\n" +
        "From: some.receiver@email.com\r\n" +
        "To: stefan@gmail.com\r\n" +
        "\r\n" +
        "This is the body of the mail.\r\n",
    );

    assert.ok(mail_builder.to_string().includes("From: some.receiver@email.com"));
});

test("It can build simple part twice", () => {
    const part = PartBuilder.create_html_part("<div>Hello!</div>");

    PartBuilder.set_header(part, "Content-Transfer-Encoding", "7 bit");

    const email = new MailBuilder(part);

    assert.equal(
        email.to_string(),
        "Content-Type: text/html\r\n" +
        "Content-Transfer-Encoding: 7 bit\r\n" +
        "MIME-Version: 1.0\r\n" +
        "\r\n" +
        "<div>Hello!</div>\r\n",
    );
});

test("It can handle part being inserted into non-multipart", () => {
    const part = PartBuilder.create_html_part("<div>This should transfer to child part</div>");
    const child_part = PartBuilder.create_html_part("<div>This should be sibling part</div>");

    PartBuilder.set_header(part, "Content-Transfer-Encoding", "7 bit");
    PartBuilder.set_header(child_part, "Content-Transfer-Encoding", "7 bit");

    const new_part = PartBuilder.append_part(part, child_part);

    const email = new MailBuilder(new_part)
        .set_subject("Some subject")
        .set_sender("from@email.com")
        .set_receiver("to@email.com");

    assert.equal(
        email.to_string(100000),
        "MIME-Version: 1.0\r\n" +
        "Subject: Some subject\r\n" +
        "From: from@email.com\r\n" +
        "To: to@email.com\r\n" +
        "Content-Type: multipart/mixed; boundary=\"====100001==\"\r\n" +
        "\r\n" +
        "--====100001==\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Transfer-Encoding: 7 bit\r\n" +
        "\r\n" +
        "<div>This should transfer to child part</div>\r\n" +
        "\r\n" +
        "--====100001==\r\n" +
        "Content-Type: text/html\r\n" +
        "Content-Transfer-Encoding: 7 bit\r\n" +
        "\r\n" +
        "<div>This should be sibling part</div>\r\n" +
        "--====100001==--\r\n"
    );
});
