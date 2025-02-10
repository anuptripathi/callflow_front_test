// app/api/save-flow/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { nodes, edges } = await request.json();
    const flow = { nodes, edges };

    // Choose a file path to store the flow.
    // Adjust this path as needed; here we use the "flows" folder in the project root.
    const filePath = path.join(process.cwd(), "flows", "flow.json");

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the flow JSON to file
    await fs.writeFile(filePath, JSON.stringify(flow, null, 2), "utf8");

    return NextResponse.json({ message: "Flow saved successfully", filePath });
  } catch (error) {
    console.error("Error saving flow:", error);
    return NextResponse.json({ error: "Failed to save flow" }, { status: 500 });
  }
}
