import { test } from "node:test";
import assert from "node:assert/strict";

import { PartBuilder } from "./mail_parts";

test("it can set child part", () => {
    let base_part = PartBuilder.create_multi_part("mixed");
    let first_child = PartBuilder.create_text_part("Hello from TEXT");
    let second_child = PartBuilder.create_html_part("Hello from HTML");

    PartBuilder.append_part(base_part, first_child);
    PartBuilder.append_part(base_part, second_child);

    assert.strictEqual(base_part.data.part_kind, "multipart");
    assert.equal(base_part.data.children.length, 2);
    assert.equal(base_part.data.children[0].data.part_kind, "plain_text");
    assert.ok(base_part.data.children[0].data.content.includes("Hello from TEXT"));

    assert.equal(base_part.data.children[1].data.part_kind, "html");
    assert.ok(base_part.data.children[1].data.content.includes("Hello from HTML"));
})

test("it can correctly set headers", () => {
    let base_part = PartBuilder.create_multi_part("mixed");
    PartBuilder.set_header(base_part, "Envelope-To", "gerhardus@email.mail");

    let first_child = PartBuilder.create_text_part("Hello from TEXT");
    PartBuilder.set_header(first_child, "Content-Transfer-Encoding", "7 bit");
    let second_child = PartBuilder.create_html_part("Hello from HTML");
    PartBuilder.set_header(second_child, "Content-Transfer-Encoding", "8 bit");

    PartBuilder.append_part(base_part, first_child);
    PartBuilder.append_part(base_part, second_child);

    assert.strictEqual(base_part.data.part_kind, "multipart");
    assert.equal(base_part.data.children.length, 2);
    assert.equal(base_part.headers["Envelope-To"], "gerhardus@email.mail");
    assert.equal(base_part.data.children[0].headers["Content-Transfer-Encoding"], "7 bit");
    assert.equal(base_part.data.children[1].headers["Content-Transfer-Encoding"], "8 bit");
})
