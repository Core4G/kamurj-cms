/**
 * vacancy-application controller
 */

import { factories } from '@strapi/strapi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_CV_MIME_TYPES = new Set([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const toTrimmedString = (value: unknown) => String(value || '').trim();

const parseRequestData = (body: any) => {
	const rawData = body?.data;

	if (typeof rawData === 'string') {
		try {
			return JSON.parse(rawData);
		} catch (_error) {
			return body || {};
		}
	}

	if (rawData && typeof rawData === 'object') {
		return rawData;
	}

	return body || {};
};

const pickCvFile = (files: any) => {
	const directCv = files?.cv;
	if (Array.isArray(directCv)) {
		return directCv[0];
	}

	if (directCv) {
		return directCv;
	}

	const nestedCv = files?.files?.cv;
	if (Array.isArray(nestedCv)) {
		return nestedCv[0];
	}

	return nestedCv || null;
};

const isAllowedCvFile = (file: any) => {
	const mimeType = String(file?.type || file?.mime || '').toLowerCase();
	const fileName = String(file?.name || file?.originalFilename || '').toLowerCase();

	if (ALLOWED_CV_MIME_TYPES.has(mimeType)) {
		return true;
	}

	return fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');
};

const normalizeUploadPath = (value: unknown) => {
	const rawValue = toTrimmedString(value);
	if (!rawValue) {
		return '';
	}

	if (rawValue.startsWith('/uploads/')) {
		return rawValue;
	}

	try {
		const parsedUrl = new URL(rawValue);
		if (parsedUrl.pathname.startsWith('/uploads/')) {
			return parsedUrl.pathname;
		}
	} catch (_error) {
	}

	const uploadsIndex = rawValue.indexOf('/uploads/');
	if (uploadsIndex >= 0) {
		return rawValue.slice(uploadsIndex);
	}

	return '';
};

const extractAppliedForSource = (data: any) => {
	return (
		data?.appliedForUrl ||
		data?.appliedFor ||
		data?.applied_for ||
		data?.appliedFor?.url ||
		''
	);
};

export default factories.createCoreController('api::vacancy-application.vacancy-application', ({ strapi }) => ({
	async create(ctx) {
		const data = parseRequestData(ctx.request.body);
		const name = toTrimmedString(data?.name);
		const surname = toTrimmedString(data?.surname);
		const phone = toTrimmedString(data?.phone);
		const email = toTrimmedString(data?.email);
		const appliedForSource = extractAppliedForSource(data);
		const appliedForPath = normalizeUploadPath(appliedForSource);
		const cvFile = pickCvFile(ctx.request.files);

		if (!name || !surname || !phone || !email) {
			return ctx.badRequest('name, surname, phone and email are required');
		}

		if (!EMAIL_REGEX.test(email)) {
			return ctx.badRequest('invalid email format');
		}

		if (!cvFile) {
			return ctx.badRequest('cv file is required');
		}

		if (!isAllowedCvFile(cvFile)) {
			return ctx.badRequest('cv must be a pdf, doc or docx file');
		}

		const uploadedFiles = await strapi.plugin('upload').service('upload').upload({
			data: {},
			files: cvFile,
		});

		const uploadedCv = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
		const uploadedCvId = uploadedCv?.id;

		if (!uploadedCvId) {
			return ctx.internalServerError('failed to upload cv');
		}

		let appliedForMediaId: number | null = null;

		if (appliedForPath) {
			const appliedForMedia = await strapi.db.query('plugin::upload.file').findOne({
				where: { url: appliedForPath },
			});

			if (!appliedForMedia?.id) {
				return ctx.badRequest(`appliedFor media not found for path: ${appliedForPath}`);
			}

			appliedForMediaId = appliedForMedia.id;
		}

		const createdEntry = await strapi.entityService.create('api::vacancy-application.vacancy-application', {
			data: {
				name,
				surname,
				phone,
				email,
				processed: false,
				cv: uploadedCvId,
				...(appliedForMediaId ? { appliedFor: appliedForMediaId } : {}),
				publishedAt: new Date(),
			},
			populate: {
				cv: true,
				appliedFor: true,
			},
		});

		try {
			const to = process.env.NOTIFY_EMAIL;

			if (to) {
				const cvUrl = uploadedCv?.url ? `${toTrimmedString(process.env.STRAPI_PUBLIC_URL)}${uploadedCv.url}` : '';
				const appliedForUrl = appliedForPath ? `${toTrimmedString(process.env.STRAPI_PUBLIC_URL)}${appliedForPath}` : '';
				await strapi.plugin('email').service('email').send({
					to,
					subject: 'New vacancy application',
					text: `
						<b>Name:</b> ${name} ${surname}<br/>
						<b>Phone:</b> ${phone}<br/>
						<b>Email:</b> ${email}<br/>
						${appliedForUrl ? `<b>Applied For:</b> ${appliedForUrl}<br/>` : ''}
						<b>CV:</b> ${cvUrl || uploadedCv?.name || uploadedCvId}<br/>
					`,
				});
			}
		} catch (error) {
			strapi.log.error('Vacancy application email send failed', error);
		}

		const sanitizedEntity = await this.sanitizeOutput(createdEntry, ctx);
		return this.transformResponse(sanitizedEntity);
	},
}));
