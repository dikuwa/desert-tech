/**
 * GET /d/[code]/download — Download a shared document PDF.
 *
 * Same as /pdf but with Content-Disposition: attachment to force download.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveShortLink } from "@/lib/document-share";
import { verifyDocumentToken } from "@/lib/document-tokens";
import { generateDocumentPdf } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const result = await resolveShortLink(code);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    const payload = verifyDocumentToken(result.token);
    if (!payload?.data) {
      return NextResponse.json({ error: "Document data not found." }, { status: 404 });
    }

    const { buffer, filename } = await generateDocumentPdf({
      documentNumber: payload.documentNumber,
      referenceId: payload.referenceId,
      snapshot: payload.data,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[Download Route] Error:", error);
    return NextResponse.json({ error: "Could not generate the PDF." }, { status: 500 });
  }
}
