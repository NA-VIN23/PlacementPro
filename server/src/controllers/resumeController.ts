import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import PDFDocument from 'pdfkit';

// ==========================================
// HTML TEMPLATES (PREVIEW)
// ==========================================

// ==========================================
// HTML TEMPLATES (PREVIEW)
// ==========================================

const getClassicHTML = (data: any) => `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000; padding: 40px; background: white; line-height: 1.4;">
        <div style="text-align: center; margin-bottom: 25px;">
            ${data.profilePhoto ? `<img src="${data.profilePhoto}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 10px;" />` : ''}
            <h1 style="font-size: 24px; text-transform: uppercase; margin: 0 0 5px 0; font-weight: bold;">${data.fullName || 'YOUR NAME'}</h1>
            <p style="font-size: 11px; margin: 0;">
                ${data.email || ''} ${data.phone ? ` • ${data.phone}` : ''}
                ${data.linkedin ? ` • <a href="${data.linkedin}" style="color: #000; text-decoration: none;">LinkedIn</a>` : ''}
                ${data.github ? ` • <a href="${data.github}" style="color: #000; text-decoration: none;">GitHub</a>` : ''}
            </p>
        </div>

        ${data.objective ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px;">Career Objective</h2>
                <p style="font-size: 12px; margin: 0;">${data.objective}</p>
            </div>
        ` : ''}

        ${data.education?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Education</h2>
                ${data.education.map((edu: any) => `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                            <span>${edu.college}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="font-style: italic;">${edu.degree}</span>
                            <span>${edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.skills ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px;">Skills</h2>
                <p style="font-size: 12px; margin: 0;">${data.skills}</p>
            </div>
        ` : ''}

        ${(data.technicalTools || data.softSkills) ? `
             <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px;">Tools & Soft Skills</h2>
                ${data.technicalTools ? `<p style="font-size: 12px; margin: 0 0 4px 0;"><strong>Technical Tools:</strong> ${data.technicalTools}</p>` : ''}
                ${data.softSkills ? `<p style="font-size: 12px; margin: 0;"><strong>Soft Skills:</strong> ${data.softSkills}</p>` : ''}
            </div>
        ` : ''}

        ${(data.experience && data.experience.length) ? `
             <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Experience</h2>
                ${data.experience.map((exp: any) => `
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <strong style="font-size: 12px;">${exp.role}</strong>
                            <span style="font-size: 11px;">${exp.duration}</span>
                        </div>
                        <div style="font-size: 11px; font-style: italic; margin-bottom: 2px;">${exp.company}</div>
                        <div style="font-size: 12px;">${exp.responsibilities || exp.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${data.projects?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Projects</h2>
                ${data.projects.map((proj: any) => `
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <strong style="font-size: 12px;">${proj.title}</strong>
                        </div>
                        <div style="font-size: 11px; font-style: italic; margin-bottom: 2px;">${proj.technologies}</div>
                        <div style="font-size: 12px;">${proj.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.certifications?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Certifications</h2>
                ${data.certifications.map((cert: any) => `
                    <div style="margin-bottom: 4px; font-size: 12px;">
                       <strong>${cert.name}</strong> - ${cert.organization} ${cert.year ? `(${cert.year})` : ''}
                       ${cert.url ? `<br/><a href="${cert.url}" style="color: #666; font-size: 11px;">View Certificate</a>` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.achievements?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Achievements</h2>
                <ul style="padding-left: 20px; font-size: 12px; margin: 0;">
                ${data.achievements.map((ach: any) => `
                    <li style="margin-bottom: 4px;">${ach}</li>
                `).join('')}
                </ul>
            </div>
        ` : ''}

        ${data.coCurricularActivities?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 2px;">Extra-Curricular</h2>
                <ul style="padding-left: 20px; font-size: 12px; margin: 0;">
                ${data.coCurricularActivities.map((act: any) => `
                    <li style="margin-bottom: 4px;">${act}</li>
                `).join('')}
                </ul>
            </div>
        ` : ''}

        ${data.languages?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px;">Languages</h2>
                 <p style="font-size: 12px; margin: 0;">
                 ${data.languages.map((l: any) => `${l.language} (${l.proficiency})`).join(' • ')}
                 </p>
            </div>
        ` : ''}
    </div>
`;

const getModernHTML = (data: any) => `
    <div style="font-family: Helvetica, Arial, sans-serif; color: #333; padding: 40px; background: white; line-height: 1.5;">
        <div style="margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 5px 0; color: #111;">${(data.fullName || 'Your Name').toUpperCase()}</h1>
                <p style="font-size: 10px; margin: 0; color: #666; letter-spacing: 0.5px;">
                    ${data.email || ''} 
                    ${data.phone ? ` | ${data.phone}` : ''}
                    ${data.linkedin ? ` | <a href="${data.linkedin}" style="color: #666; text-decoration: none;">LINKEDIN</a>` : ''}
                    ${data.github ? ` | <a href="${data.github}" style="color: #666; text-decoration: none;">GITHUB</a>` : ''}
                </p>
            </div>
            ${data.profilePhoto ? `<img src="${data.profilePhoto}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" />` : ''}
        </div>

        ${data.objective ? `
            <div style="margin-bottom: 25px;">
                <p style="font-size: 12px; color: #333; font-style: italic;">${data.objective}</p>
            </div>
        ` : ''}

        ${data.education?.length ? `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 15px;">Education</h2>
                ${data.education.map((edu: any) => `
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <span style="font-size: 14px; font-weight: bold; color: #000;">${edu.college}</span>
                            <span style="font-size: 12px; color: #666;">${edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}</span>
                        </div>
                        <div style="font-size: 12px; color: #444;">${edu.degree}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.skills ? `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 10px;">Technical Skills</h2>
                <p style="font-size: 12px; color: #333;">${data.skills}</p>
            </div>
        ` : ''}

        ${(data.technicalTools || data.softSkills) ? `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 10px;">Additional Skills</h2>
                 ${data.technicalTools ? `<p style="font-size: 12px; color: #333; margin-bottom: 4px;"><strong>Tools:</strong> ${data.technicalTools}</p>` : ''}
                 ${data.softSkills ? `<p style="font-size: 12px; color: #333;"><strong>Soft Skills:</strong> ${data.softSkills}</p>` : ''}
            </div>
        ` : ''}
        
        ${(data.experience && data.experience.length) ? `
             <div style="margin-bottom: 20px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 15px;">Experience</h2>
                ${data.experience.map((exp: any) => `
                    <div style="margin-bottom: 15px;">
                        <div style="margin-bottom: 4px;">
                            <span style="font-size: 13px; font-weight: bold; color: #000;">${exp.role}</span>
                            <span style="font-size: 11px; color: #666; margin-left: 8px;">${exp.company} | ${exp.duration}</span>
                        </div>
                        <div style="font-size: 12px; color: #333;">${exp.responsibilities || exp.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.projects?.length ? `
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 15px;">Projects</h2>
                ${data.projects.map((proj: any) => `
                    <div style="margin-bottom: 15px;">
                        <div style="margin-bottom: 4px;">
                            <span style="font-size: 13px; font-weight: bold; color: #000;">${proj.title}</span>
                            <span style="font-size: 11px; color: #666; font-style: italic; margin-left: 8px;">${proj.technologies}</span>
                        </div>
                        <div style="font-size: 12px; color: #333;">${proj.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${(data.certifications?.length || data.achievements?.length) ? `
             <div style="margin-bottom: 25px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 15px;">Achievements & Certifications</h2>
                <ul style="padding-left: 20px; font-size: 12px; color: #333; margin: 0;">
                    ${data.certifications?.map((c: any) => `<li><strong>${c.name}</strong> - ${c.organization}</li>`).join('') || ''}
                    ${data.achievements?.map((a: any) => `<li>${a}</li>`).join('') || ''}
                </ul>
            </div>
        ` : ''}

         ${data.languages?.length ? `
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #444; letter-spacing: 1px; margin-bottom: 10px;">Languages</h2>
                 <p style="font-size: 12px; color: #333;">
                 ${data.languages.map((l: any) => `${l.language} <span style="color:#777; font-size:10px;">(${l.proficiency})</span>`).join(' • ')}
                 </p>
            </div>
        ` : ''}
    </div>
`;

const getCompactHTML = (data: any) => `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000; padding: 30px; background: white; line-height: 1.2;">
        <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h1 style="font-size: 20px; text-transform: uppercase; margin: 0; font-weight: bold;">${data.fullName || 'YOUR NAME'}</h1>
            <p style="font-size: 9px; margin: 2px 0 0 0;">
                ${data.email || ''} ${data.phone ? ` • ${data.phone}` : ''}
                ${data.linkedin ? ` • <a href="${data.linkedin}" style="color: #000;">LinkedIn</a>` : ''}
            </p>
        </div>

        ${data.objective ? `
            <div style="margin-bottom: 10px;">
                 <p style="font-size: 10px; font-style: italic; margin: 0;">${data.objective}</p>
            </div>
        ` : ''}

        ${data.education?.length ? `
            <div style="margin-bottom: 12px;">
                <h2 style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Education</h2>
                ${data.education.map((edu: any) => `
                    <div style="margin-bottom: 4px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px;">
                            <strong>${edu.college}</strong>
                            <span>${edu.cgpa ? `CGPA: ${edu.cgpa}` : ''}</span>
                        </div>
                        <div style="font-size: 10px; font-style: italic;">${edu.degree}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.skills ? `
            <div style="margin-bottom: 12px;">
                <h2 style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 2px 0;">Skills</h2>
                <p style="font-size: 10px; margin: 0;">${data.skills}</p>
            </div>
        ` : ''}

         ${(data.experience && data.experience.length) ? `
             <div style="margin-bottom: 12px;">
                 <h2 style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Experience</h2>
                ${data.experience.map((exp: any) => `
                    <div style="margin-bottom: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1px;">
                             <strong>${exp.role}</strong>
                             <span style="font-size: 9px;">${exp.duration}</span>
                        </div>
                        <div style="font-size: 9px; font-style: italic;">${exp.company}</div>
                        <div style="font-size: 10px;">${exp.responsibilities || exp.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${data.projects?.length ? `
            <div style="margin-bottom: 12px;">
                <h2 style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Projects</h2>
                ${data.projects.map((proj: any) => `
                    <div style="margin-bottom: 6px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1px;">
                            <strong>${proj.title}</strong>
                        </div>
                        <div style="font-size: 9px; font-style: italic; margin-bottom: 1px;">${proj.technologies}</div>
                        <div style="font-size: 10px;">${proj.description}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${(data.achievements?.length || data.certifications?.length) ? `
             <div style="margin-bottom: 12px;">
                <h2 style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Achievements</h2>
                <ul style="margin: 0; padding-left: 15px; font-size: 10px;">
                     ${data.achievements?.map((a: any) => `<li>${a}</li>`).join('') || ''}
                     ${data.certifications?.map((c: any) => `<li>${c.name} (${c.year})</li>`).join('') || ''}
                </ul>
            </div>
        ` : ''}
    </div>
`;

// ==========================================
// PDF RENDERERS (DOWNLOAD)
// ==========================================

const renderClassicPDF = (doc: PDFKit.PDFDocument, data: any) => {
    // Header
    doc.font('Times-Bold').fontSize(24).text((data.fullName || '').toUpperCase(), { align: 'center' });
    doc.moveDown(0.3);

    doc.font('Times-Roman').fontSize(10);
    let contact = data.email || '';
    if (data.phone) contact += ` • ${data.phone}`;
    doc.text(contact, { align: 'center' });

    // Link Helper
    const links = [];
    if (data.linkedin) links.push(data.linkedin);
    if (data.github) links.push(data.github);
    if (links.length > 0) doc.text(links.join(' • '), { align: 'center' });

    doc.moveDown(1.5);

    const drawSection = (title: string) => {
        doc.font('Times-Bold').fontSize(11).text(title.toUpperCase());
        doc.moveTo(doc.x, doc.y + 2).lineTo(550, doc.y + 2).lineWidth(1).stroke();
        doc.moveDown(0.6);
    };

    if (data.objective) {
        drawSection('Career Objective');
        doc.font('Times-Roman').fontSize(10.5).text(data.objective, { align: 'justify' });
        doc.moveDown();
    }

    if (data.education?.length) {
        drawSection('Education');
        data.education.forEach((edu: any) => {
            doc.font('Times-Bold').fontSize(11).text(edu.college);
            doc.font('Times-Italic').fontSize(10).text(`${edu.degree} ${edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}`);
            doc.moveDown(0.5);
        });
        doc.moveDown();
    }

    if (data.skills) {
        drawSection('Technical Skills');
        doc.font('Times-Roman').fontSize(10.5).text(data.skills, { align: 'justify' });
        doc.moveDown();
    }

    if (data.technicalTools || data.softSkills) {
        drawSection('Tools & Soft Skills');
        if (data.technicalTools) {
            doc.font('Times-Bold').fontSize(10.5).text('Tools: ', { continued: true });
            doc.font('Times-Roman').text(data.technicalTools);
        }
        if (data.softSkills) {
            doc.font('Times-Bold').fontSize(10.5).text('Soft Skills: ', { continued: true });
            doc.font('Times-Roman').text(data.softSkills);
        }
        doc.moveDown();
    }

    if (data.experience?.length) {
        drawSection('Experience');
        data.experience.forEach((exp: any) => {
            doc.font('Times-Bold').fontSize(11).text(exp.role);
            doc.font('Times-Italic').fontSize(10).text(`${exp.company} (${exp.duration})`);
            doc.font('Times-Roman').fontSize(10.5).text(exp.responsibilities || exp.description, { align: 'justify' });
            doc.moveDown(0.8);
        });
        doc.moveDown();
    }

    if (data.projects?.length) {
        drawSection('Key Projects');
        data.projects.forEach((proj: any) => {
            doc.font('Times-Bold').fontSize(11).text(proj.title);
            doc.font('Times-Italic').fontSize(10).fillColor('#333').text(proj.technologies);
            doc.fillColor('black');
            doc.font('Times-Roman').fontSize(10.5).text(proj.description, { align: 'justify' });
            doc.moveDown(0.8);
        });
    }

    if (data.certifications?.length) {
        doc.moveDown();
        drawSection('Certifications');
        data.certifications.forEach((cert: any) => {
            doc.font('Times-Bold').fontSize(10.5).text(cert.name, { continued: true });
            doc.font('Times-Roman').text(` - ${cert.organization} ${cert.year ? `(${cert.year})` : ''}`);
        });
    }

    if (data.achievements?.length) {
        doc.moveDown();
        drawSection('Achievements');
        data.achievements.forEach((ach: string) => {
            doc.font('Times-Roman').fontSize(10.5).text(`• ${ach}`);
        });
    }

    if (data.languages?.length) {
        doc.moveDown();
        drawSection('Languages');
        const langs = data.languages.map((l: any) => `${l.language} (${l.proficiency})`).join(' • ');
        doc.font('Times-Roman').fontSize(10.5).text(langs);
    }
};

const renderModernPDF = (doc: PDFKit.PDFDocument, data: any) => {
    // Helvetica, Uppercase, Open Layout
    doc.font('Helvetica-Bold').fontSize(26).text((data.fullName || '').toUpperCase());
    doc.moveDown(0.2);

    doc.font('Helvetica').fontSize(9).fillColor('#555');
    let contact = data.email || '';
    if (data.phone) contact += ` | ${data.phone}`;
    if (data.linkedin) contact += ` | ${data.linkedin}`;
    if (data.github) contact += ` | ${data.github}`;
    doc.text(contact);
    doc.fillColor('black');

    doc.moveDown(1.5);

    const drawSection = (title: string) => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#333').text(title.toUpperCase(), { characterSpacing: 1 });
        doc.moveDown(0.5);
    };

    if (data.objective) {
        doc.font('Helvetica-Oblique').fontSize(10).text(data.objective);
        doc.moveDown(1);
    }

    if (data.education?.length) {
        drawSection('Education');
        data.education.forEach((edu: any) => {
            doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text(edu.college);
            doc.font('Helvetica').fontSize(10).fillColor('#444').text(`${edu.degree} ${edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}`);
            doc.moveDown(0.5);
        });
        doc.moveDown(1);
    }

    if (data.skills) {
        drawSection('Technical Skills');
        doc.font('Helvetica').fontSize(10).fillColor('black').text(data.skills, { align: 'justify' });
        doc.moveDown(1);
    }

    if (data.technicalTools || data.softSkills) {
        drawSection('Additional Skills');
        if (data.technicalTools) {
            doc.font('Helvetica-Bold').fontSize(10).text('Tools: ', { continued: true });
            doc.font('Helvetica').text(data.technicalTools);
        }
        if (data.softSkills) {
            doc.font('Helvetica-Bold').fontSize(10).text('Soft Skills: ', { continued: true });
            doc.font('Helvetica').text(data.softSkills);
        }
        doc.moveDown(1);
    }

    if (data.experience?.length) {
        drawSection('Experience');
        data.experience.forEach((exp: any) => {
            doc.font('Helvetica-Bold').fontSize(11).text(exp.role);
            doc.font('Helvetica-Oblique').fontSize(9).fillColor('#555').text(`${exp.company} | ${exp.duration}`);
            doc.font('Helvetica').fontSize(10).fillColor('black').text(exp.responsibilities || exp.description, { align: 'justify' });
            doc.moveDown(0.8);
        });
        doc.moveDown(1);
    }

    if (data.projects?.length) {
        drawSection('Projects');
        data.projects.forEach((proj: any) => {
            doc.font('Helvetica-Bold').fontSize(11).text(proj.title);
            doc.font('Helvetica-Oblique').fontSize(9).fillColor('#555').text(proj.technologies);
            doc.font('Helvetica').fontSize(10).fillColor('black').text(proj.description, { align: 'justify' });
            doc.moveDown(0.8);
        });
    }

    if (data.certifications?.length || data.achievements?.length) {
        doc.moveDown(1);
        drawSection('Achievements & Certifications');
        data.certifications?.forEach((c: any) => {
            doc.font('Helvetica').fontSize(10).text(`• ${c.name} - ${c.organization}`);
        });
        data.achievements?.forEach((a: string) => {
            doc.font('Helvetica').fontSize(10).text(`• ${a}`);
        });
    }
};

const renderCompactPDF = (doc: PDFKit.PDFDocument, data: any) => {
    // Times, Smaller, Header Line
    doc.font('Times-Bold').fontSize(20).text((data.fullName || '').toUpperCase(), { align: 'center' });

    doc.font('Times-Roman').fontSize(9);
    let contact = data.email || '';
    if (data.phone) contact += ` • ${data.phone}`;
    if (data.linkedin) contact += ` • ${data.linkedin}`;
    doc.text(contact, { align: 'center' });

    doc.moveDown(0.5);
    doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).lineWidth(0.5).stroke();
    doc.moveDown(0.8);

    const drawSection = (title: string) => {
        doc.font('Times-Bold').fontSize(10).text(title.toUpperCase());
        doc.moveDown(0.2);
    };

    if (data.objective) {
        doc.font('Times-Italic').fontSize(9).text(data.objective);
        doc.moveDown(0.5);
    }

    if (data.education?.length) {
        drawSection('Education');
        data.education.forEach((edu: any) => {
            doc.font('Times-Bold').fontSize(10).text(edu.college, { continued: true });
            if (edu.cgpa) doc.font('Times-Roman').text(`  (CGPA: ${edu.cgpa})`, { align: 'right' });
            else doc.text('');

            doc.font('Times-Italic').text(edu.degree);
            doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
    }

    if (data.skills) {
        drawSection('Skills');
        doc.font('Times-Roman').fontSize(10).text(data.skills);
        doc.moveDown(0.5);
    }

    if (data.projects?.length) {
        drawSection('Projects');
        data.projects.forEach((proj: any) => {
            doc.font('Times-Bold').fontSize(10).text(proj.title);
            doc.font('Times-Italic').fontSize(9).text(proj.technologies);
            doc.font('Times-Roman').fontSize(10).text(proj.description, { align: 'justify' });
            doc.moveDown(0.4);
        });
    }

    if (data.experience?.length) {
        drawSection('Experience');
        data.experience.forEach((exp: any) => {
            doc.font('Times-Bold').fontSize(10).text(exp.role, { continued: true });
            doc.font('Times-Italic').fontSize(9).text(`  ${exp.company}`, { align: 'right' });
            doc.font('Times-Roman').fontSize(10).text(exp.responsibilities || exp.description);
            doc.moveDown(0.4);
        });
    }
};


// ==========================================
// CONTROLLERS
// ==========================================

// In-memory fallback cache
const resumeCache = new Map<string, any>();

export const generateResume = async (req: Request, res: Response) => {
    try {
        const { template = 'classic', ...data } = req.body;
        // @ts-ignore
        const studentId = req.user?.userId;

        // 1. Scoring Logic Checks (Existing)
        let score = 0;
        const suggestions: string[] = [];
        if (data.skills && data.skills.split(',').length >= 5) score += 20;
        else suggestions.push("Add more skills (at least 5 relevant skills)");

        // ... (preserving existing scoring logic abbreviated for brevity, but crucial to include)
        if (data.projects && data.projects.length >= 2) score += 20;
        else suggestions.push("Add at least 2 key projects");

        if (data.education && data.education.length >= 1) score += 10;
        else suggestions.push("Education section is missing");

        if (data.linkedin) score += 10;
        if (data.fullName && data.email && data.phone) score += 20;
        if (data.projects && data.projects.some((p: any) => p.description && p.description.length > 50)) score += 20;

        score = Math.min(100, score);
        if (score === 100 && suggestions.length === 0) suggestions.push("Great job! Your resume looks ATS-ready.");

        // 2. Generate HTML based on Template
        let html = '';
        switch (template) {
            case 'modern': html = getModernHTML(data); break;
            case 'compact': html = getCompactHTML(data); break;
            default: html = getClassicHTML(data);
        }

        // 3. Save to DB (Store template choice)
        const resumeDataToSave = { ...data, template };
        let resumeId = null;

        try {
            const { data: saved, error } = await supabase.from('resumes').insert({
                student_id: studentId,
                resume_data: resumeDataToSave,
                score
            }).select().single();

            if (error) throw error;
            resumeId = saved.id;
        } catch (e) {
            const tempId = `temp-${Date.now()}`;
            resumeId = tempId;
            resumeCache.set(tempId, {
                student_id: studentId,
                resume_data: resumeDataToSave,
                score
            });
        }

        res.json({
            resumeId,
            resumeHtml: html,
            score,
            suggestions
        });

    } catch (err: any) {
        console.error("Resume Generation Error:", err);
        res.status(500).json({ message: 'Generation failed', error: err.message });
    }
};

export const downloadResume = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).send("Missing Resume ID");

        let data: any = null;
        let template = 'classic';
        const resumeId = String(id);

        if (!resumeId.startsWith('temp-')) {
            const { data: resume } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();
            if (resume) {
                data = resume.resume_data;
                if (data.template) template = data.template;
            }
        }

        if (!data) {
            const cached = resumeCache.get(resumeId);
            if (cached) {
                data = cached.resume_data;
                if (data.template) template = data.template;
            }
        }

        if (!data) return res.status(404).send("Resume not found or expired");

        // --- CONTENT GENERATION ---
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resume-${Date.now()}.pdf`);

        doc.pipe(res);

        if (template === 'modern') {
            renderModernPDF(doc, data);
        } else if (template === 'compact') {
            renderCompactPDF(doc, data);
        } else {
            renderClassicPDF(doc, data);
        }

        doc.end();

    } catch (err: any) {
        console.error("PDF Generation Error:", err);
        res.status(500).send("Download failed");
    }
};
