export const getContactMessage = (message: { category: string; email: string }) => {
  return `
  <div>
  <p><strong>Contact us received</strong></p>
  <p>Type: ${message.category}</p>
  <p>From: ${message.email}</p>
</div>`
}
