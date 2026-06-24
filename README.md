# Usage

A mail is built from a tree of parts. Combine your parts, and call `to_string(initial_boundary?: number)` at the end.

Currently there is not yet support for automatic content transfer encoding detection, so everything is quite manual, this library only helps in drafting the mails and building the parts from the object structure.

Therefore it is recommended to set all required headers manually, apart from the multipart boundaries, as this is handled in the background during the `to_string(initial_boundary?: number)` process.

```ts
function write_mail(): string {
    // Start by creating the root part that will hold all child parts.
    // This is normally a multi part if we are trying to do anything interesting.
    const root_part = PartBuilder.create_multi_part("alternative");

    // Create other parts and append them to the root part.
    const text_part = PartBuilder.create_text_part("This is a plain text part with some text");
    // If this is unpleasant, you can do text_part["Content-Transfer-Encoding"] = "8 bit";
    PartBuilder.set_header(text_part, "Content-Transfer-Encoding", "8 bit")

    // You may build the mail in two ways. Either mutably, repeatedly appending to the root part, or/
    PartBuilder.append_part(
        root_part,
        text_part
    );

    const html_part = PartBuilder.create_html_part("<div>This is an HTML part</div>");
    PartBuilder.set_header(html_part, "Content-Transfer-Encoding", "8 bit")
    // Functionally where at each step the full tree is passed back to the caller.
    const stage_two = PartBuilder.append_part(
        stage_one,
        html_part,
    );

    // NOTE: It is important to realise the slight differences between these two calls.
    // Both versions will try to mutate the original object, but in a case where this cannot be done,
    // for example in a case where you want to append to a text part, for type safety reasons, we
    // can't directly mutate the existing parts, so you may prefer to use the functional version instead,
    // otherwise you might encounter some unpredictable behaviour. See the tests in this repository
    // for more information.

    // Finally, build the mail using the root part, this just gives some convenience methods to set top level headers etc.
    let mail = new MailBuilder(stage_two);

    return mail
        .set_sender("mailperson@mail.com")
        .set_receiver("stefan@gmail.com")
        .to_string();
}
```
