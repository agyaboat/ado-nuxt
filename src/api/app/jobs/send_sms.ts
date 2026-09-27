import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'
import { sendSms } from '#helpers/send_sms'

interface SendSmsPayload {
  phoneNumber: string
  message: string
}

export default class SendSms extends Job<SendSmsPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    const { phoneNumber, message } = this.payload

    await sendSms(phoneNumber, message)
    // const d = await sendSms(phoneNumber, message)
    // console.log('receieved: ', d)
  }

  async failed(error: Error) {
    console.error('SendSms failed:', error.message)
  }
}
