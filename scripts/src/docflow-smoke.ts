import assert from "node:assert/strict";

const baseUrl = process.env.DOCFLOW_API_BASE_URL ?? "http://localhost:80/api";

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json();
  assert.equal(response.ok, true, `${path} returned ${response.status}: ${JSON.stringify(body)}`);
  return body as Record<string, unknown>;
}

const users = (await request("/users")) as unknown as Array<{ id: string }>;
assert.equal(users.length, 3, "seeded workspace should contain three demo users");
assert.ok(users.some((user) => user.id === "maya"), "Maya should be available");

const created = await request("/documents", {
  method: "POST",
  headers: { "X-User-Id": "maya" },
  body: JSON.stringify({
    title: "Smoke test document",
    content: "<h1>Smoke test document</h1><p>Saved content.</p>",
  }),
});
assert.equal(created.ownerId, "maya");
assert.equal(created.title, "Smoke test document");

const id = String(created.id);
const updated = await request(`/documents/${id}`, {
  method: "PATCH",
  headers: { "X-User-Id": "maya" },
  body: JSON.stringify({
    content: "<h1>Smoke test document</h1><ul><li>Saved content.</li></ul>",
  }),
});
assert.equal(updated.content, "<h1>Smoke test document</h1><ul><li>Saved content.</li></ul>");
assert.ok(Number(updated.wordCount) > 0);

const shared = await request(`/documents/${id}/share`, {
  method: "POST",
  headers: { "X-User-Id": "maya" },
  body: JSON.stringify({ userId: "sam" }),
});
assert.equal((shared.shares as Array<{ userId: string }>).some((share) => share.userId === "sam"), true);

const samDocuments = (await request("/documents", {
  headers: { "X-User-Id": "sam" },
})) as unknown as Array<{ id: string; access: string }>;
assert.equal(samDocuments.some((document) => document.id === id && document.access === "shared"), true);

console.log("DocFlow smoke test passed: create, save, share, and shared access.");