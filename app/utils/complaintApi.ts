export async function submitComplaint(subject: string, description: string) {
  try {
    const response = await fetch(
      "http://localhost:3001/api/complaints/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject,
          description,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to submit complaint");
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to submit complaint",
    };
  }
}
