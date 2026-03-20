export default {
  async afterCreate(event) {
    const { result } = event;

    const to = process.env.NOTIFY_EMAIL;

    // Re-fetch with relations populated so we have branch title and loan name
    const fullEntry = await strapi
      .documents('api::loan-application.loan-application')
      .findOne({ documentId: result.documentId, populate: ['branch', 'loan'], status: 'published' });

    const branchTitle = (fullEntry?.branch as any)?.title ?? '—';
    const loanName = (fullEntry?.loan as any)?.name ?? '—';

    try {
      await strapi.plugin('email').service('email').send({
        to,
        subject: `New loan application`,
        html: `
            <b>Name:</b> ${result.name} ${result.surname}<br/>
            <b>Phone:</b> ${result.phoneNumber}<br/>
            <b>Email:</b> ${result.email}<br/>
            <b>Branch:</b> ${branchTitle}<br/>
            <b>Loan:</b> ${loanName}<br/>
        `,
      });
    } catch (err) {
      strapi.log.error('Email send failed', err);
    }
  },
};
