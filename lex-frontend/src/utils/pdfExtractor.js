export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const pdfjsLib = await import(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        )
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        const typedArray = new Uint8Array(e.target.result)
        const pdf = await pdfjsLib.getDocument(typedArray).promise
        let fullText = ""

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items.map((item) => item.str).join(" ")
          fullText += text + "\n\n"
        }

        if (!fullText.trim()) {
          reject(new Error(
            "No text found in PDF. The file may be scanned or image-based."
          ))
          return
        }

        resolve(fullText.trim())
      } catch (err) {
        reject(new Error("Failed to read PDF: " + err.message))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
