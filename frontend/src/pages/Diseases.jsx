import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  AlertTriangle,
  Stethoscope,
  ArrowLeft,
} from 'lucide-react';

const DISEASES = [
  { name: 'Fungal Infection', category: 'Infectious', severity: 'Low', symptoms: ['itching', 'skin rash', 'nodal skin eruptions', 'dischromic patches'], description: 'A common infection caused by fungi that affects skin, nails, or mucous membranes. Usually treatable with antifungal medications.', whenToSeeDoctor: 'If symptoms persist for more than 2 weeks or spread rapidly.' },
  { name: 'Allergy', category: 'Immune', severity: 'Low', symptoms: ['continuous sneezing', 'watering from eyes', 'chills', 'shivering'], description: 'An immune system response to a foreign substance (allergen) that is not typically harmful to the body.', whenToSeeDoctor: 'If you experience severe reactions like difficulty breathing or swelling.' },
  { name: 'GERD', category: 'Digestive', severity: 'Moderate', symptoms: ['stomach pain', 'acidity', 'chest pain', 'vomiting'], description: 'Gastroesophageal Reflux Disease occurs when stomach acid frequently flows back into the esophagus, causing heartburn.', whenToSeeDoctor: 'If heartburn occurs more than twice a week or interferes with daily life.' },
  { name: 'Chronic Cholestasis', category: 'Liver', severity: 'Moderate', symptoms: ['itching', 'vomiting', 'yellowish skin', 'nausea', 'loss of appetite'], description: 'A condition where bile flow from the liver is reduced or blocked, leading to buildup of bile acids in the blood.', whenToSeeDoctor: 'If you notice yellowing of skin or eyes, or persistent itching.' },
  { name: 'Drug Reaction', category: 'Immune', severity: 'Moderate', symptoms: ['itching', 'skin rash', 'stomach pain', 'spotting urination'], description: 'Adverse reactions to medications ranging from mild rashes to severe systemic responses.', whenToSeeDoctor: 'Immediately if you experience swelling, difficulty breathing, or widespread rash.' },
  { name: 'Peptic Ulcer Disease', category: 'Digestive', severity: 'Moderate', symptoms: ['vomiting', 'loss of appetite', 'abdominal pain', 'passage of gases'], description: 'Open sores that develop on the inner lining of the stomach or upper small intestine, often caused by H. pylori bacteria.', whenToSeeDoctor: 'If you have severe stomach pain, bloody stools, or unexplained weight loss.' },
  { name: 'AIDS', category: 'Infectious', severity: 'High', symptoms: ['muscle wasting', 'patches in throat', 'high fever', 'extra marital contacts'], description: 'Acquired Immunodeficiency Syndrome is caused by HIV and severely weakens the immune system.', whenToSeeDoctor: 'Immediately if you suspect exposure. Early treatment is critical.' },
  { name: 'Diabetes', category: 'Metabolic', severity: 'High', symptoms: ['fatigue', 'weight loss', 'increased appetite', 'blurred and distorted vision', 'obesity', 'excessive hunger', 'polyuria', 'irregular sugar level'], description: 'A metabolic disease that causes high blood sugar due to insufficient insulin production or response.', whenToSeeDoctor: 'If you experience excessive thirst, frequent urination, or unexplained weight loss.' },
  { name: 'Gastroenteritis', category: 'Digestive', severity: 'Low', symptoms: ['vomiting', 'diarrhoea', 'dehydration', 'sunken eyes'], description: 'Inflammation of the stomach and intestines, typically caused by a viral or bacterial infection. Often called "stomach flu."', whenToSeeDoctor: 'If symptoms last more than 3 days or you show signs of severe dehydration.' },
  { name: 'Bronchial Asthma', category: 'Respiratory', severity: 'Moderate', symptoms: ['fatigue', 'cough', 'breathlessness', 'high fever', 'mucoid sputum', 'family history'], description: 'A chronic condition where airways narrow and swell, producing extra mucus, making breathing difficult.', whenToSeeDoctor: 'If you have frequent breathing difficulties or your inhaler is not providing relief.' },
  { name: 'Hypertension', category: 'Cardiovascular', severity: 'High', symptoms: ['headache', 'chest pain', 'dizziness', 'loss of balance', 'lack of concentration'], description: 'Persistently elevated blood pressure that increases risk of heart disease, stroke, and other conditions.', whenToSeeDoctor: 'If your blood pressure consistently reads above 140/90 mmHg.' },
  { name: 'Migraine', category: 'Neurological', severity: 'Low', symptoms: ['headache', 'acidity', 'visual disturbances', 'excessive hunger', 'stiff neck', 'irritability'], description: 'A neurological condition causing intense, debilitating headaches often accompanied by nausea and light sensitivity.', whenToSeeDoctor: 'If migraines increase in frequency or severity, or are accompanied by new symptoms.' },
  { name: 'Cervical Spondylosis', category: 'Musculoskeletal', severity: 'Moderate', symptoms: ['neck pain', 'back pain', 'dizziness', 'loss of balance', 'weakness in limbs'], description: 'Age-related wear and tear of the spinal discs in the neck, causing stiffness and pain.', whenToSeeDoctor: 'If you experience numbness, tingling, or weakness in arms or legs.' },
  { name: 'Paralysis (Brain Hemorrhage)', category: 'Neurological', severity: 'High', symptoms: ['vomiting', 'headache', 'altered sensorium', 'weakness of one body side'], description: 'Loss of muscle function caused by bleeding in the brain. A medical emergency requiring immediate treatment.', whenToSeeDoctor: 'IMMEDIATELY. Call emergency services if you suspect a brain hemorrhage.' },
  { name: 'Jaundice', category: 'Liver', severity: 'Moderate', symptoms: ['itching', 'vomiting', 'fatigue', 'yellowish skin', 'high fever', 'dark urine'], description: 'Yellowing of skin and eyes caused by excess bilirubin in the blood, often indicating liver problems.', whenToSeeDoctor: 'If you notice yellowing of skin or eyes. Requires investigation of underlying cause.' },
  { name: 'Malaria', category: 'Infectious', severity: 'High', symptoms: ['chills', 'vomiting', 'high fever', 'sweating', 'headache', 'nausea', 'muscle pain'], description: 'A mosquito-borne disease caused by Plasmodium parasites. Common in tropical and subtropical regions.', whenToSeeDoctor: 'Immediately if you have fever after visiting a malaria-endemic region.' },
  { name: 'Chicken Pox', category: 'Infectious', severity: 'Low', symptoms: ['itching', 'skin rash', 'fatigue', 'high fever', 'red spots over body', 'loss of appetite'], description: 'A highly contagious viral infection causing an itchy, blister-like rash. Mostly affects children.', whenToSeeDoctor: 'If rash spreads to eyes, fever exceeds 102°F, or symptoms are severe.' },
  { name: 'Dengue', category: 'Infectious', severity: 'High', symptoms: ['skin rash', 'chills', 'joint pain', 'vomiting', 'fatigue', 'high fever', 'headache', 'nausea', 'muscle pain', 'back pain', 'red spots over body', 'loss of appetite', 'pain behind the eyes'], description: 'A mosquito-borne viral disease common in tropical areas. Can progress to severe dengue, which can be life-threatening.', whenToSeeDoctor: 'Immediately if you develop severe abdominal pain, persistent vomiting, or bleeding.' },
  { name: 'Typhoid', category: 'Infectious', severity: 'Moderate', symptoms: ['chills', 'vomiting', 'fatigue', 'high fever', 'headache', 'nausea', 'constipation', 'abdominal pain', 'diarrhoea'], description: 'A bacterial infection spread through contaminated food and water. Causes prolonged fever and digestive issues.', whenToSeeDoctor: 'If you have a sustained fever above 103°F, especially after travel to endemic areas.' },
  { name: 'Hepatitis A', category: 'Liver', severity: 'Moderate', symptoms: ['joint pain', 'vomiting', 'yellowish skin', 'dark urine', 'nausea', 'loss of appetite', 'abdominal pain', 'muscle pain'], description: 'A highly contagious liver infection caused by the hepatitis A virus, usually spread through contaminated food/water.', whenToSeeDoctor: 'If you develop jaundice or symptoms persist beyond a few days.' },
  { name: 'Hepatitis B', category: 'Liver', severity: 'High', symptoms: ['itching', 'fatigue', 'yellowish skin', 'dark urine', 'loss of appetite', 'abdominal pain', 'yellow urine', 'receiving blood transfusion'], description: 'A serious liver infection caused by the hepatitis B virus. Can become chronic and lead to liver failure or cancer.', whenToSeeDoctor: 'If you suspect exposure or develop symptoms of liver disease.' },
  { name: 'Hepatitis C', category: 'Liver', severity: 'High', symptoms: ['fatigue', 'yellowish skin', 'nausea', 'loss of appetite', 'family history'], description: 'A viral infection causing liver inflammation, sometimes leading to serious liver damage. Often has no symptoms initially.', whenToSeeDoctor: 'If you have risk factors for hepatitis C or develop liver-related symptoms.' },
  { name: 'Hepatitis D', category: 'Liver', severity: 'High', symptoms: ['joint pain', 'vomiting', 'fatigue', 'yellowish skin', 'dark urine', 'nausea', 'loss of appetite', 'abdominal pain'], description: 'A serious liver disease caused by the hepatitis D virus. Only occurs in people also infected with hepatitis B.', whenToSeeDoctor: 'Immediately if you have hepatitis B and develop worsening symptoms.' },
  { name: 'Hepatitis E', category: 'Liver', severity: 'Moderate', symptoms: ['joint pain', 'vomiting', 'fatigue', 'high fever', 'yellowish skin', 'dark urine', 'nausea', 'loss of appetite', 'abdominal pain'], description: 'A liver disease caused by the hepatitis E virus, typically spread through contaminated water.', whenToSeeDoctor: 'If jaundice develops or if you are pregnant (can be severe in pregnancy).' },
  { name: 'Alcoholic Hepatitis', category: 'Liver', severity: 'High', symptoms: ['vomiting', 'yellowish skin', 'abdominal pain', 'swelling of stomach', 'distention of abdomen', 'fluid overload'], description: 'Liver inflammation caused by excessive alcohol consumption. Can lead to cirrhosis and liver failure.', whenToSeeDoctor: 'If you have a history of heavy drinking and develop abdominal pain or jaundice.' },
  { name: 'Tuberculosis', category: 'Infectious', severity: 'High', symptoms: ['chills', 'vomiting', 'fatigue', 'cough', 'high fever', 'breathlessness', 'sweating', 'weight loss', 'loss of appetite', 'blood in sputum', 'phlegm', 'mild fever'], description: 'A bacterial infection primarily affecting the lungs. Highly contagious and spread through airborne droplets.', whenToSeeDoctor: 'If you have a persistent cough lasting more than 3 weeks, especially with blood in sputum.' },
  { name: 'Common Cold', category: 'Respiratory', severity: 'Low', symptoms: ['continuous sneezing', 'chills', 'fatigue', 'cough', 'high fever', 'headache', 'swelled lymph nodes', 'throat irritation', 'redness of eyes', 'sinus pressure', 'congestion', 'chest pain', 'loss of smell', 'muscle pain', 'runny nose', 'phlegm', 'malaise'], description: 'A viral infection of the upper respiratory tract. Usually mild and resolves within 7-10 days.', whenToSeeDoctor: 'If symptoms worsen after a week or you develop high fever, severe sinus pain, or ear pain.' },
  { name: 'Pneumonia', category: 'Respiratory', severity: 'High', symptoms: ['chills', 'fatigue', 'cough', 'high fever', 'breathlessness', 'sweating', 'chest pain', 'fast heart rate', 'rusty sputum', 'malaise', 'phlegm'], description: 'A lung infection that inflames air sacs, potentially filling them with fluid. Can range from mild to life-threatening.', whenToSeeDoctor: 'If you have difficulty breathing, chest pain, persistent fever, or cough with pus.' },
  { name: 'Heart Attack', category: 'Cardiovascular', severity: 'High', symptoms: ['vomiting', 'chest pain', 'breathlessness', 'sweating'], description: 'Occurs when blood flow to the heart is severely reduced or blocked. A life-threatening medical emergency.', whenToSeeDoctor: 'IMMEDIATELY. Call emergency services. Every minute matters.' },
  { name: 'Varicose Veins', category: 'Cardiovascular', severity: 'Low', symptoms: ['fatigue', 'cramps', 'bruising', 'obesity', 'swollen legs', 'prominent veins on calf'], description: 'Enlarged, twisted veins that commonly appear in the legs. Usually a cosmetic concern but can cause discomfort.', whenToSeeDoctor: 'If veins become painful, swollen, or if skin changes develop near the veins.' },
  { name: 'Hypothyroidism', category: 'Metabolic', severity: 'Moderate', symptoms: ['fatigue', 'weight gain', 'cold hands and feets', 'mood swings', 'lethargy', 'dizziness', 'puffy face and eyes', 'enlarged thyroid', 'brittle nails', 'swollen extremeties', 'depression', 'irritability', 'abnormal menstruation'], description: 'A condition where the thyroid gland does not produce enough hormones, slowing metabolism.', whenToSeeDoctor: 'If you experience persistent fatigue, unexplained weight gain, or sensitivity to cold.' },
  { name: 'Hyperthyroidism', category: 'Metabolic', severity: 'Moderate', symptoms: ['fatigue', 'mood swings', 'weight loss', 'restlessness', 'sweating', 'diarrhoea', 'fast heart rate', 'muscle weakness', 'irritability', 'abnormal menstruation'], description: 'Overactive thyroid producing excess hormones, speeding up metabolism abnormally.', whenToSeeDoctor: 'If you have unexplained weight loss, rapid heartbeat, or unusual sweating.' },
  { name: 'Hypoglycemia', category: 'Metabolic', severity: 'Moderate', symptoms: ['vomiting', 'fatigue', 'headache', 'nausea', 'sweating', 'blurred and distorted vision', 'excessive hunger', 'anxiety', 'palpitations', 'slurred speech', 'drying and tingling lips', 'irritability'], description: 'Abnormally low blood sugar, often a side effect of diabetes treatment. Can cause confusion and loss of consciousness.', whenToSeeDoctor: 'If episodes are frequent, or if you lose consciousness during an episode.' },
  { name: 'Osteoarthritis', category: 'Musculoskeletal', severity: 'Moderate', symptoms: ['joint pain', 'neck pain', 'hip joint pain', 'knee pain', 'swelling joints', 'painful walking', 'stiff neck'], description: 'The most common form of arthritis, caused by wear-and-tear damage to joint cartilage over time.', whenToSeeDoctor: 'If joint pain or stiffness interferes with daily activities.' },
  { name: 'Arthritis', category: 'Musculoskeletal', severity: 'Moderate', symptoms: ['muscle weakness', 'stiff neck', 'swelling joints', 'movement stiffness', 'painful walking'], description: 'Inflammation of one or more joints, causing pain and stiffness that typically worsens with age.', whenToSeeDoctor: 'If you experience persistent joint pain, swelling, or reduced range of motion.' },
  { name: 'Acne', category: 'Dermatological', severity: 'Low', symptoms: ['skin rash', 'pus filled pimples', 'blackheads', 'scurring'], description: 'A skin condition that occurs when hair follicles become clogged with oil and dead skin cells.', whenToSeeDoctor: 'If over-the-counter treatments are not working after several weeks, or if acne is severe.' },
  { name: 'Urinary Tract Infection', category: 'Infectious', severity: 'Moderate', symptoms: ['burning micturition', 'bladder discomfort', 'foul smell of urine', 'continuous feel of urine'], description: 'An infection in any part of the urinary system. More common in women and usually affects the bladder.', whenToSeeDoctor: 'If you have burning during urination, blood in urine, or fever.' },
  { name: 'Psoriasis', category: 'Dermatological', severity: 'Moderate', symptoms: ['skin rash', 'joint pain', 'skin peeling', 'silver like dusting', 'small dents in nails', 'inflammatory nails'], description: 'A chronic autoimmune condition that causes rapid skin cell buildup, resulting in scaling on the skin surface.', whenToSeeDoctor: 'If the condition is widespread, painful, or affecting your quality of life.' },
  { name: 'Impetigo', category: 'Dermatological', severity: 'Low', symptoms: ['skin rash', 'high fever', 'blister', 'red sore around nose', 'yellow crust ooze'], description: 'A highly contagious bacterial skin infection forming sores and blisters. Most common in young children.', whenToSeeDoctor: 'If sores do not improve after a few days of treatment or if fever develops.' },
  { name: 'Dimorphic Hemorrhoids (Piles)', category: 'Digestive', severity: 'Low', symptoms: ['constipation', 'pain during bowel movements', 'pain in anal region', 'bloody stool', 'irritation in anus'], description: 'Swollen veins in the lower rectum and anus that can cause discomfort, bleeding, and itching.', whenToSeeDoctor: 'If you have persistent bleeding, pain, or hemorrhoids that do not improve with home treatment.' },
];

const CATEGORIES = [...new Set(DISEASES.map((d) => d.category))].sort();

const SEVERITY_COLORS = {
  Low: 'bg-green-100 text-green-700',
  Moderate: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
};

export default function Diseases() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState(null);

  const filtered = useMemo(() => {
    return DISEASES.filter((d) => {
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        d.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'All' || d.category === filterCategory;
      const matchesSeverity = filterSeverity === 'All' || d.severity === filterSeverity;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [search, filterCategory, filterSeverity]);

  if (selectedDisease) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div>
          <button
            onClick={() => setSelectedDisease(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to encyclopedia
          </button>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedDisease.name}</h1>
              <span className={`badge ${SEVERITY_COLORS[selectedDisease.severity]}`}>
                {selectedDisease.severity} severity
              </span>
            </div>

            <span className="badge bg-gray-100 text-gray-600 mb-4 inline-block">
              {selectedDisease.category}
            </span>

            <p className="text-gray-600 leading-relaxed mb-6">{selectedDisease.description}</p>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Common Symptoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDisease.symptoms.map((s) => (
                  <span key={s} className="badge bg-primary-50 text-primary-700">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> When to see a doctor
              </h3>
              <p className="text-sm text-amber-700">{selectedDisease.whenToSeeDoctor}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-purple-50 rounded-xl">
            <BookOpen className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h1 className="section-title !mb-0">Disease Encyclopedia</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse all {DISEASES.length} conditions our AI can detect
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diseases, symptoms, or categories..."
              className="input-field !pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="All">All Severity</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Showing {filtered.length} of {DISEASES.length} conditions
        </p>
      </div>

      {/* Disease Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No diseases found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((disease) => (
            <button
              key={disease.name}
              onClick={() => setSelectedDisease(disease)}
              className="card text-left hover:scale-[1.02] transition-transform cursor-pointer !p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-sm">{disease.name}</h3>
                <span className={`badge text-xs !px-2 !py-0.5 ${SEVERITY_COLORS[disease.severity]}`}>
                  {disease.severity}
                </span>
              </div>
              <span className="text-xs text-gray-400 block mb-2">{disease.category}</span>
              <p className="text-xs text-gray-500 line-clamp-2">{disease.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {disease.symptoms.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
                {disease.symptoms.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    +{disease.symptoms.length - 3} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
