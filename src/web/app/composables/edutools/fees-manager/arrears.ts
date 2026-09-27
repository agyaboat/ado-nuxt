import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { storeToRefs } from 'pinia'

export function downloadArrearsTablePdf(
  students: ArrearsStudent[],
  classLabel: string,
  variantLabel: string | null,
  filename: string,
) {
  const { access } = storeToRefs(useFeesManagerAccessStore())

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14

  const schoolName =
    access.value?.school?.name?.trim() || 'School'

  const generatedAt = new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())

  const totalArrears = students.reduce(
    (total, student) => total + student.outstandingAmount,
    0,
  )

  const formatPdfMoney = (amount: number) => {
    return `GHS ${(amount / 100).toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  /*
   * --------------------------------------------------------------------------
   * Document header
   * --------------------------------------------------------------------------
   */

  doc.setTextColor(25, 35, 32)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(schoolName, margin, 16)

  doc.setFontSize(18)
  doc.text('Student Arrears Report', margin, 27)

  /*
   * --------------------------------------------------------------------------
   * Report metadata
   * --------------------------------------------------------------------------
   */

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(60, 70, 67)

  doc.text(`Class: ${classLabel}`, margin, 38)

  let metadataY = 38

  if (variantLabel) {
    metadataY = 45

    doc.text(`Variant: ${variantLabel}`, margin, metadataY)
  }

  metadataY += 7

  doc.text(
    `Students owing: ${students.length}`,
    margin,
    metadataY,
  )

  doc.setFontSize(8.5)
  doc.setTextColor(105, 115, 112)

  doc.text(
    `Generated: ${generatedAt}`,
    pageWidth - margin,
    metadataY,
    {
      align: 'right',
    },
  )

  /*
   * --------------------------------------------------------------------------
   * Table
   * --------------------------------------------------------------------------
   *
   * The header uses a muted, darker emerald rather than a bright saturated
   * green. The footer uses a very light green-gray tint.
   */

  autoTable(doc, {
    startY: metadataY + 9,

    head: [
      ['#', 'Student Name', 'Admission ID', 'Total Arrears'],
    ],

    body: students.map((student, index) => [
      index + 1,
      student.name,
      student.admissionNumber ?? '—',
      formatPdfMoney(student.outstandingAmount),
    ]),

    foot: [
      [
        '',
        '',
        'Grand total',
        formatPdfMoney(totalArrears),
      ],
    ],

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3.2,
      lineWidth: 0.1,
      lineColor: [215, 224, 220],
      textColor: [35, 42, 40],
      valign: 'middle',
    },

    headStyles: {
      fillColor: [39, 91, 79],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0.1,
      halign: 'left',
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
      valign: 'middle',
    },

    footStyles: {
      fillColor: [237, 244, 241],
      textColor: [35, 65, 57],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0.1,
    },

    alternateRowStyles: {
      fillColor: [248, 250, 249],
    },

    columnStyles: {
      0: {
        cellWidth: 10,
        halign: 'center',
      },

      1: {
        cellWidth: 'auto',
      },

      2: {
        cellWidth: 32,
      },

      3: {
        cellWidth: 40,
        // halign: 'right',
      },
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 16,
    },

    /*
     * Keep the report heading repeated if the table continues onto
     * subsequent pages.
     */
    showHead: 'everyPage',
  })

  /*
   * --------------------------------------------------------------------------
   * Page footer
   * --------------------------------------------------------------------------
   */

  const pageCount = doc.getNumberOfPages()

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(125, 135, 132)

    doc.text(
      `${schoolName} · Fees Manager`,
      margin,
      pageHeight - 8,
    )

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      {
        align: 'right',
      },
    )
  }

  doc.save(filename)
}