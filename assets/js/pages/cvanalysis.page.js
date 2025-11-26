/**
 * cvanalysis.page.js - CV Analysis page rendering (FIXED)
 */

async function renderCVAnalysisPage() {
    const mainContent = document.querySelector('.dashboard-content');
    if (!mainContent) return;
    
    try {
        const user = await API.getCurrentUser();
        
        // Free tier users see locked modal
        if (user.tier === 'free') {
            showTierModal('CV Analysis', 'pro');
            return;
        }
        
        // Pro+ users see the upload interface
        mainContent.innerHTML = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">CV Analysis</h2>
                <p style="color: rgba(255, 255, 255, 0.6);">Professional CV feedback and optimization</p>
            </div>

            <div class="cv-analysis-container">
                <div class="glass-card">
                    <h3 style="font-size: 20px; font-weight: 700; color: white; margin-bottom: 24px;">
                        <i class="fas fa-file-upload"></i> Upload Your CV
                    </h3>
                    
                    <div id="uploadArea" style="border: 2px dashed rgba(59, 130, 246, 0.5); border-radius: 12px; padding: 32px; 
                        text-align: center; cursor: pointer; transition: all 0.3s ease;"
                        onmouseover="this.style.borderColor='rgba(59, 130, 246, 0.8)'; this.style.background='rgba(59, 130, 246, 0.05)'"
                        onmouseout="this.style.borderColor='rgba(59, 130, 246, 0.5)'; this.style.background='transparent'"
                        onclick="document.getElementById('cvFileInput').click()">
                        
                        <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                        <h4 style="color: white; margin: 0 0 8px 0;">Drag and drop your CV here</h4>
                        <p style="color: rgba(255, 255, 255, 0.6); margin: 0;">or click to select from your device</p>
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 8px;">
                            Supported: PDF only • Max size: 5MB
                        </p>
                    </div>
                    
                    <input type="file" id="cvFileInput" style="display: none;" accept=".pdf" 
                        onchange="handleCVUpload(event)">
                    
                    <div id="uploadStatus" style="margin-top: 16px;"></div>
                    
                    <div id="analysisResults" style="margin-top: 24px; display: none;">
                        <h4 style="color: white; margin-bottom: 16px;">Analysis Results</h4>
                        <div id="resultsContent"></div>
                    </div>
                </div>

                <div class="glass-card" style="margin-top: 24px;">
                    <h3 style="font-size: 16px; font-weight: 700; color: white; margin-bottom: 12px;">
                        <i class="fas fa-info-circle"></i> Features
                    </h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 8px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i> Top Skills Detection
                        </li>
                        <li style="padding: 8px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i> ATS Score Analysis
                        </li>
                        ${user.tier === 'premium' ? `
                        <li style="padding: 8px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i> Career Trajectory Analysis
                        </li>
                        <li style="padding: 8px 0; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i> Salary Recommendations
                        </li>
                        ` : ''}
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading CV Analysis page:', error);
        mainContent.innerHTML = `
            <div class="page-header" style="margin-bottom: 32px;">
                <h2 class="page-title">CV Analysis</h2>
            </div>
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Page</h3>
                <p>Failed to load CV Analysis. Please try again.</p>
            </div>
        `;
    }
}

async function handleCVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const uploadStatus = document.getElementById('uploadStatus');
    if (!uploadStatus) return;
    
    const user = await API.getCurrentUser();
    
    // Validation
    if (file.type !== 'application/pdf') {
        uploadStatus.innerHTML = `<div style="color: #f87171; font-size: 14px;">
            <i class="fas fa-exclamation-circle"></i> Only PDF files are supported
        </div>`;
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        uploadStatus.innerHTML = `<div style="color: #f87171; font-size: 14px;">
            <i class="fas fa-exclamation-circle"></i> File size must be less than 5MB
        </div>`;
        return;
    }
    
    // Show loading state
    uploadStatus.innerHTML = `<div style="color: #3b82f6; font-size: 14px;">
        <i class="fas fa-spinner fa-spin"></i> Analyzing your CV...
    </div>`;
    
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Choose endpoint based on tier
        const endpoint = user.tier === 'premium' 
            ? '/api/documents/cv/analyze-premium'
            : '/api/documents/cv/analyze-lite';
        
        // **USE NEW API.uploadFile METHOD**
        const data = await API.uploadFile(endpoint, formData);
        console.log('Analysis result:', data);
        
        // Extract analysis data
        const analysis = data?.analysis || data?.lite_analysis || data;
        
        // Display results
        let resultsHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        `;
        
        if (analysis.top_skills && analysis.top_skills.length > 0) {
            resultsHTML += `
                <div style="background: rgba(59, 130, 246, 0.15); padding: 16px; border-radius: 8px;">
                    <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Top Skills</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${analysis.top_skills.map(skill => `
                            <span style="background: rgba(59, 130, 246, 0.3); color: #3b82f6; 
                                padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                                ${skill}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (analysis.format_score !== undefined) {
            resultsHTML += `
                <div style="background: rgba(16, 185, 129, 0.15); padding: 16px; border-radius: 8px;">
                    <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Format Score</h5>
                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">${analysis.format_score}/10</div>
                </div>
            `;
        }
        
        if (analysis.experience_level) {
            resultsHTML += `
                <div style="background: rgba(168, 85, 247, 0.15); padding: 16px; border-radius: 8px;">
                    <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Experience Level</h5>
                    <div style="color: #a855f7; font-weight: 600; text-transform: capitalize;">${analysis.experience_level}</div>
                </div>
            `;
        }
        
        if (user.tier === 'premium' && data.premium_analysis) {
            if (data.premium_analysis.ats_score !== undefined) {
                resultsHTML += `
                    <div style="background: rgba(168, 85, 247, 0.15); padding: 16px; border-radius: 8px;">
                        <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">ATS Score</h5>
                        <div style="font-size: 24px; font-weight: 700; color: #a855f7;">${data.premium_analysis.ats_score}%</div>
                    </div>
                `;
            }
            
            if (data.premium_analysis.salary_range) {
                resultsHTML += `
                    <div style="background: rgba(249, 115, 22, 0.15); padding: 16px; border-radius: 8px;">
                        <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Salary Range</h5>
                        <div style="color: #f97316; font-weight: 600;">${data.premium_analysis.salary_range}</div>
                    </div>
                `;
            }
            
            if (data.premium_analysis.career_trajectory) {
                resultsHTML += `
                    <div style="background: rgba(34, 197, 94, 0.15); padding: 16px; border-radius: 8px; grid-column: span 2;">
                        <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Career Trajectory</h5>
                        <div style="color: rgba(255, 255, 255, 0.8);">${data.premium_analysis.career_trajectory}</div>
                    </div>
                `;
            }
        }
        
        resultsHTML += '</div>';
        
        if (analysis.improvements && analysis.improvements.length > 0) {
            resultsHTML += `
                <div style="margin-top: 16px;">
                    <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Improvement Areas</h5>
                    <ul style="list-style: none; padding: 0; margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
                        ${analysis.improvements.map(imp => `
                            <li style="padding: 6px 0;">
                                <i class="fas fa-arrow-right" style="color: #fbbf24; margin-right: 8px;"></i>
                                ${imp}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            resultsHTML += `
                <div style="margin-top: 16px;">
                    <h5 style="color: white; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Recommendations</h5>
                    <ul style="list-style: none; padding: 0; margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
                        ${analysis.recommendations.map(rec => `
                            <li style="padding: 6px 0;">
                                <i class="fas fa-lightbulb" style="color: #fbbf24; margin-right: 8px;"></i>
                                ${rec}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        document.getElementById('analysisResults').style.display = 'block';
        document.getElementById('resultsContent').innerHTML = resultsHTML;
        uploadStatus.innerHTML = `<div style="color: #10b981; font-size: 14px;">
            <i class="fas fa-check-circle"></i> Analysis complete!
        </div>`;
        
    } catch (error) {
        console.error('CV analysis failed:', error);
        uploadStatus.innerHTML = `<div style="color: #f87171; font-size: 14px;">
            <i class="fas fa-exclamation-circle"></i> ${error.message}
        </div>`;
    }
}

window.renderCVAnalysisPage = renderCVAnalysisPage;
window.handleCVUpload = handleCVUpload;