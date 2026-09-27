<script setup lang="ts">
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { storeToRefs } from 'pinia'
// Capacitor Plugins
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

interface Student {
  label: string
  sublabel: string
  value: string
  outstandingAmount: number
}

interface ArrearsPeriod {
  id: string
  label: string
  total: number
  paid: number
  balance: number
}

interface AcademicYearArrears {
  id: string
  label: string
  periods: ArrearsPeriod[]
  totalDebt: number
}

interface OldArrears {
  id: string
  total: number
  paid: number
}

interface StudentArrears {
  old: OldArrears | null
  years: AcademicYearArrears[]
  grandTotal: number
}

const props = defineProps<{
  student: Student
  arrears: StudentArrears
}>()

const accessStore = useFeesManagerAccessStore()
const { access } = storeToRefs(accessStore)

const schoolName = computed(() => {
  return access.value?.school?.name?.trim() || 'School'
})

function formatMoney(amount: number) {
  return `GHS ${(amount / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getStudentName() {
  return props.student.label.trim() || 'Student'
}

function getFilename() {
  const studentName = getStudentName()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${studentName || 'student'}-arrears-breakdown.pdf`
}

function download() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const margin = 16

  const emerald = [39, 91, 79] as [number, number, number]
  const dark = [20, 30, 45] as [number, number, number]
  const muted = [95, 105, 115] as [number, number, number]
  const lightBorder = [220, 226, 232] as [number, number, number]
  const lightBackground = [245, 248, 247] as [number, number, number]

  /*
   * Header
   */
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(schoolName.value, margin, 20)

  doc.setTextColor(...emerald)
  doc.setFontSize(13)
  doc.text('Student Arrears Breakdown', margin, 28)

  /*
   * Student information
   */
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(getStudentName(), margin, 40)

  if (props.student.sublabel?.trim()) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text(props.student.sublabel.trim(), margin, 46)
  }

  /*
   * Generated information
   */
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...muted)

  const generatedText = `Generated ${formatDateTime(new Date())}`

  doc.text(
    generatedText,
    pageWidth - margin - doc.getTextWidth(generatedText),
    40,
  )

  /*
   * Academic-year sections
   */
  let currentY = 56

  for (const year of props.arrears.years) {
    /*
     * Prevent the year heading from being stranded at the
     * bottom of a page.
     */
    if (currentY > pageHeight - 65) {
      doc.addPage()
      currentY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...dark)
    doc.text(year.label, margin, currentY)

    const yearAmount = formatMoney(year.totalDebt)

    doc.setFontSize(10)
    doc.setTextColor(...muted)
    doc.text(
      yearAmount,
      pageWidth - margin - doc.getTextWidth(yearAmount),
      currentY,
    )

    autoTable(doc, {
      startY: currentY + 5,
      margin: {
        left: margin,
        right: margin,
      },
      head: [['Period', 'Total', 'Paid', 'Balance']],
      body: year.periods.map((period) => [
        period.label,
        formatMoney(period.total),
        formatMoney(period.paid),
        formatMoney(period.balance),
      ]),
      foot: [['Total Debt', '', '', formatMoney(year.totalDebt)]],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: dark,
        lineColor: lightBorder,
        lineWidth: 0.2,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: emerald,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: lightBackground,
        textColor: dark,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: {
          cellWidth: 'auto',
        },
        1: {
          halign: 'right',
        },
        2: {
          halign: 'right',
        },
        3: {
          halign: 'right',
          fontStyle: 'bold',
        },
      },
      alternateRowStyles: {
        fillColor: [250, 251, 251],
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 14
  }

  /*
   * Previous arrears
   */
  if (props.arrears.old) {
    if (currentY > pageHeight - 65) {
      doc.addPage()
      currentY = 20
    }

    const old = props.arrears.old

    const oldBalance = Math.max(
      old.total - old.paid,
      0,
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...dark)
    doc.text('Previous Arrears', margin, currentY)

    currentY += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...muted)
    doc.text(
      'Balance carried over from before using ScholarSaaS',
      margin,
      currentY,
    )

    autoTable(doc, {
      startY: currentY + 4,
      margin: {
        left: margin,
        right: margin,
      },
      head: [['Total', 'Paid', 'Balance']],
      body: [[
        formatMoney(old.total),
        formatMoney(old.paid),
        formatMoney(oldBalance),
      ]],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: dark,
        lineColor: lightBorder,
        lineWidth: 0.2,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: emerald,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: {
          halign: 'right',
        },
        1: {
          halign: 'right',
        },
        2: {
          halign: 'right',
          fontStyle: 'bold',
        },
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 14
  }

  /*
   * Grand Total
   */
  if (currentY > pageHeight - 45) {
    doc.addPage()
    currentY = 20
  }

  const grandTotalHeight = 16

  doc.setFillColor(...dark)
  doc.roundedRect(
    margin,
    currentY,
    pageWidth - margin * 2,
    grandTotalHeight,
    3,
    3,
    'F',
  )

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(
    'Grand Total',
    margin + 6,
    currentY + 10,
  )

  const grandTotalText = formatMoney(props.arrears.grandTotal)

  doc.setFontSize(13)
  doc.text(
    grandTotalText,
    pageWidth - margin - 6 - doc.getTextWidth(grandTotalText),
    currentY + 10,
  )

  /*
   * Page footer
   */
  const pageCount = doc.getNumberOfPages()

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)

    doc.setDrawColor(...lightBorder)
    doc.setLineWidth(0.2)
    doc.line(
      margin,
      pageHeight - 13,
      pageWidth - margin,
      pageHeight - 13,
    )

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...muted)

    doc.text(
      schoolName.value,
      margin,
      pageHeight - 8,
    )

    const pageText = `Page ${page} of ${pageCount}`

    doc.text(
      pageText,
      pageWidth - margin - doc.getTextWidth(pageText),
      pageHeight - 8,
    )
  }

  /*
   * PDF metadata
   */
  doc.setProperties({
    title: 'Student Arrears Breakdown',
    subject: `Arrears breakdown for ${getStudentName()}`,
    author: schoolName.value,
    creator: schoolName.value,
  })

  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Output jsPDF document as Base64 string
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      // 2. Write file to Native Cache Directory
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache,
      })

      // 3. Open Android share sheet to save or view
      await Share.share({
        title: fileName,
        url: savedFile.uri,
        dialogTitle: 'Save or View PDF',
      })
    } catch (error) {
      console.error('Failed to save native PDF:', error)
    }
  } else {
    // Standard Browser Download
    doc.save(fileName)
  }

  doc.save(getFilename())
}
</script>

<template>
  <div class="flex justify-end pt-1">
    <Button
      label="Download PDF"
      icon="pi pi-file-pdf"
      severity="secondary"
      outlined
      size="small"
      type="button"
      @click="download"
    />
  </div>
</template>