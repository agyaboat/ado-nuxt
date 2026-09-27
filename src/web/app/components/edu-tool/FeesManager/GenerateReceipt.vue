<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

interface Payment {
  id: string
  student: {
    id: string
    name: string
    admissionNumber: string | null
  }
  amount: number
  mode: string
  paymentMethod: string | null
  paidAt: string
  reference: string | null
}

interface Allocation {
  id: string
  type: 'old_arrears' | 'academic_fee'
  amount: number
  academicPeriod: {
    id: string
    label: string
    academicYear: {
      id: string
      label: string
    }
  } | null
}

const props = defineProps<{
  payment: Payment
  allocations: Allocation[]
}>()

const { access } = storeToRefs(useFeesManagerAccessStore())

function formatMoney(amount: number) {
  return `GHS ${(amount / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPaymentMethod(value: string | null) {
  if (!value) {
    return '—'
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function makeFilename() {
  const admissionNumber =
    props.payment.student.admissionNumber || props.payment.student.id

  const date = new Date(props.payment.paidAt)
    .toISOString()
    .slice(0, 10)

  return `receipt-${admissionNumber}-${date}.pdf`
}

function generateReceipt() {
  const school = access.value?.school

  const schoolName = school?.name?.trim() || 'School'

  const totalAllocated = props.allocations.reduce(
    (total, allocation) => total + allocation.amount,
    0,
  )

  const unallocatedAmount = Math.max(
    props.payment.amount - totalAllocated,
    0,
  )

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const margin = 16

  const emerald = [39, 91, 79] as [number, number, number]
  const darkText = [31, 41, 38] as [number, number, number]
  const mutedText = [100, 110, 107] as [number, number, number]
  const border = [215, 224, 220] as [number, number, number]
  const lightGreen = [237, 244, 241] as [number, number, number]

  /*
   * --------------------------------------------------------------------------
   * Header
   * --------------------------------------------------------------------------
   */

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...emerald)

  doc.text(schoolName, margin, 18)

  if (school?.code) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...mutedText)

    doc.text(`School Code: ${school.code}`, margin, 24)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...darkText)

  doc.text('OFFICIAL RECEIPT', margin, 38)

  /*
   * Receipt number / date
   */

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...mutedText)

  doc.text(
    `Receipt No: ${props.payment.id}`,
    pageWidth - margin,
    34,
    { align: 'right' },
  )

  doc.text(
    `Date: ${formatDate(props.payment.paidAt)}`,
    pageWidth - margin,
    40,
    { align: 'right' },
  )

  /*
   * --------------------------------------------------------------------------
   * Student information
   * --------------------------------------------------------------------------
   */

  const infoTop = 50

  doc.setDrawColor(...border)
  doc.setLineWidth(0.2)

  doc.roundedRect(
    margin,
    infoTop,
    pageWidth - margin * 2,
    29,
    2,
    2,
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...mutedText)

  doc.text('STUDENT', margin + 5, infoTop + 8)
  doc.text('ADMISSION ID', margin + 5, infoTop + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkText)

  doc.text(
    props.payment.student.name,
    margin + 40,
    infoTop + 8,
  )

  doc.text(
    props.payment.student.admissionNumber || '—',
    margin + 40,
    infoTop + 20,
  )

  /*
   * --------------------------------------------------------------------------
   * Payment summary
   * --------------------------------------------------------------------------
   */

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkText)

  doc.text('Payment Details', margin, 91)

  autoTable(doc, {
    startY: 96,

    body: [
      ['Amount Paid', formatMoney(props.payment.amount)],
      ['Payment Method', formatPaymentMethod(props.payment.paymentMethod)],
      ['Payment Mode', props.payment.mode || '—'],
      ['Reference', props.payment.reference || '—'],
    ],

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3.2,
      lineWidth: 0.1,
      lineColor: border,
      textColor: darkText,
    },

    columnStyles: {
      0: {
        cellWidth: 42,
        fontStyle: 'bold',
      },

      1: {
        cellWidth: 'auto',
      },
    },

    alternateRowStyles: {
      fillColor: [249, 251, 250],
    },
  })

  /*
   * --------------------------------------------------------------------------
   * Allocation table
   * --------------------------------------------------------------------------
   */

  const allocationStartY =
    (doc as any).lastAutoTable.finalY + 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...darkText)

  doc.text('Payment Allocation', margin, allocationStartY)

  autoTable(doc, {
    startY: allocationStartY + 5,

    head: [
      ['#', 'Academic Year', 'Academic Period', 'Allocated'],
    ],

    body: props.allocations.map((allocation, index) => {
      if (allocation.type === 'old_arrears') {
        return [
          index + 1,
          'Previous Arrears',
          '—',
          formatMoney(allocation.amount),
        ]
      }

      return [
        index + 1,
        allocation.academicPeriod?.academicYear.label || '—',
        allocation.academicPeriod?.label || '—',
        formatMoney(allocation.amount),
      ]
    }),

    foot: [
      [
        '',
        '',
        'Total Allocated',
        formatMoney(totalAllocated),
      ],
    ],

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 8.8,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: border,
      textColor: darkText,
      valign: 'middle',
    },

    headStyles: {
      fillColor: emerald,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
    },

    footStyles: {
      fillColor: lightGreen,
      textColor: [35, 65, 57],
      fontStyle: 'bold',
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
        cellWidth: 40,
      },

      3: {
        cellWidth: 37,
        halign: 'left',
      },
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 28,
    },
  })

  /*
   * --------------------------------------------------------------------------
   * Unallocated amount
   * --------------------------------------------------------------------------
   */

  let currentY = (doc as any).lastAutoTable.finalY + 9

  if (unallocatedAmount > 0) {
    doc.setFillColor(...lightGreen)

    doc.roundedRect(
      margin,
      currentY,
      pageWidth - margin * 2,
      12,
      1.5,
      1.5,
      'F',
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...emerald)

    doc.text(
      'Unallocated Amount',
      margin + 4,
      currentY + 7.5,
    )

    doc.text(
      formatMoney(unallocatedAmount),
      pageWidth - margin - 4,
      currentY + 7.5,
      { align: 'right' },
    )

    currentY += 20
  }

  /*
   * --------------------------------------------------------------------------
   * Signature section
   * --------------------------------------------------------------------------
   */

  const signatureY = Math.max(
    currentY + 18,
    pageHeight - 55,
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...darkText)

  doc.text('Account Name:', margin, signatureY)

  doc.setDrawColor(120, 125, 123)
  doc.setLineWidth(0.25)

  doc.line(
    margin + 28,
    signatureY + 0.5,
    pageWidth / 2 - 5,
    signatureY + 0.5,
  )

  doc.text(
    'Accountant Signature:',
    pageWidth / 2 + 5,
    signatureY,
  )

  doc.line(
    pageWidth / 2 + 40,
    signatureY + 0.5,
    pageWidth - margin,
    signatureY + 0.5,
  )

  /*
   * --------------------------------------------------------------------------
   * Current academic period
   * --------------------------------------------------------------------------
   */

  const period = school?.currentAcademicPeriod

  if (period) {
    doc.setFontSize(8)
    doc.setTextColor(...mutedText)

    doc.text(
      `Current Academic Period: ${period.year.label} · ${period.label}`,
      margin,
      signatureY + 13,
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Footer
   * --------------------------------------------------------------------------
   */

  doc.setDrawColor(...border)

  doc.line(
    margin,
    pageHeight - 18,
    pageWidth - margin,
    pageHeight - 18,
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...mutedText)

  doc.text(
    'This receipt acknowledges payment received by the school.',
    margin,
    pageHeight - 11,
  )

  doc.text(
    'Page 1 of 1',
    pageWidth - margin,
    pageHeight - 11,
    { align: 'right' },
  )

  doc.setProperties({
    title: 'Official Receipt',
    subject: `Payment receipt for ${props.payment.student.name}`,
    author: schoolName,
    creator: schoolName,
  })

  doc.save(makeFilename())
}
</script>

<template>
  <Button
    label="Generate Receipt"
    icon="pi pi-file-pdf"
    severity="secondary"
    outlined
    type="button"
    :disabled="!props.allocations.length"
    @click="generateReceipt"
  />
</template>