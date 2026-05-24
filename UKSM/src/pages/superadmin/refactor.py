import re

def refactor_manajemen_soal():
    with open('d:/laragon/www/UKSM-final/konfigurasi/UKSM/src/pages/superadmin/SuperAdminManajemenSoal.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change component name
    content = content.replace("export default function SuperAdminAssessment()", "export default function SuperAdminManajemenSoal()")
    
    # Remove Monitoring State and Fetch
    content = re.sub(r'/\* ── Monitoring state ──.*?(?=/\* ── Levels)', '', content, flags=re.DOTALL)
    
    # Remove Derived monitoring stats
    content = re.sub(r'/\* ── Derived monitoring stats ──.*?(?=const totalPertanyaan)', '', content, flags=re.DOTALL)
    
    # Remove Stat Cards and Monitoring Table
    content = re.sub(r'\{/\* ═══════════════════ STAT CARDS ═══════════════ \*/\}.*?(?=\{/\* ═══════════════════ MANAJEMEN KUISIONER ═══════════════════ \*/\})', '', content, flags=re.DOTALL)

    # Change Header Title
    content = content.replace("Manajemen Assessment", "Manajemen Soal & Kuisioner")
    
    with open('d:/laragon/www/UKSM-final/konfigurasi/UKSM/src/pages/superadmin/SuperAdminManajemenSoal.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

def refactor_assessment():
    with open('d:/laragon/www/UKSM-final/konfigurasi/UKSM/src/pages/superadmin/SuperAdminassessment.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove Questionnaire State and Fetch
    content = re.sub(r'/\* ── Levels \/ Questionnaire state ──.*?(?=/\* ── Derived monitoring stats)', '', content, flags=re.DOTALL)
    
    # Remove Total Pertanyaan from Stats
    content = re.sub(r'const totalPertanyaan =.*?\n\s+0,\n\s+\);\n', '', content, flags=re.DOTALL)

    # Remove Manajemen Kuisioner and Modal
    content = re.sub(r'\{/\* ═══════════════════ MANAJEMEN KUISIONER ═══════════════════ \*/\}.*', '\n    </div>\n  );\n}', content, flags=re.DOTALL)

    with open('d:/laragon/www/UKSM-final/konfigurasi/UKSM/src/pages/superadmin/SuperAdminassessment.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

refactor_manajemen_soal()
refactor_assessment()
print("Refactoring complete")
