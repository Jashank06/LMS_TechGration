import { PrismaClient, LessonType, CourseLevel, CourseFormat, SubmissionStatus, QuestionType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting AI Course Enrichment...")

  // 1. Locate the AI course by ID or title
  let course = await prisma.course.findFirst({
    where: {
      OR: [
        { id: "6ad283b4e196d0b8fbfb9eae" },
        { title: { contains: "Artifical", mode: "insensitive" } },
        { title: { contains: "Artificial", mode: "insensitive" } },
      ],
    },
  })

  if (!course) {
    console.error("❌ Course not found! Creating course afresh...")
    course = await prisma.course.create({
      data: {
        title: "Artificial Intelligence",
        slug: "artificial-intelligence-pro",
        description: "An end-to-end industry-grade engineering program covering modern Artificial Intelligence, Deep Neural Networks, Large Language Models (LLMs), Vector Embeddings, Production RAG systems, and Autonomous Agent orchestration.",
        thumbnailUrl: "/brand/og-image.png",
        category: "AI & Machine Learning",
        level: CourseLevel.ALL_LEVELS,
        format: CourseFormat.HYBRID,
        instructorName: "Faculty Instructor",
        instructorTitle: "Senior AI & Cloud Instructor",
        durationHours: 36,
        isPublished: true,
      },
    })
  }

  // Update course metadata with rich professional details
  await prisma.course.update({
    where: { id: course.id },
    data: {
      title: "Artificial Intelligence & Modern Deep Learning Systems",
      subtitle: "Master Deep Neural Architectures, PyTorch, Transformers, LLMs, and Production RAG pipelines.",
      description: "An end-to-end industry-grade engineering program covering modern Artificial Intelligence, Deep Neural Networks, Large Language Models (LLMs), Vector Embeddings, Production RAG systems, and Autonomous Agent orchestration.",
      category: "AI & Machine Learning",
      durationHours: 36,
      level: CourseLevel.ALL_LEVELS,
      format: CourseFormat.HYBRID,
      outcomes: [
        "Build & train deep neural networks from scratch using PyTorch",
        "Master Transformer architecture, Self-Attention & LoRA fine-tuning",
        "Design production RAG pipelines with Hybrid Vector Search",
        "Deploy scalable LLM inference servers with vLLM & Quantization",
        "Earn the official TechGration Artificial Intelligence Professional Credential",
      ],
      prerequisites: [
        "Basic Python programming syntax & data structures",
        "High-school linear algebra & calculus intuition",
      ],
      isPublished: true,
    },
  })

  // Clear existing empty modules if any to start clean
  await prisma.module.deleteMany({
    where: { courseId: course.id },
  })

  const sampleVideo1 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  const sampleVideo2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  const sampleVideo3 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

  // 2. Create 5 Comprehensive Modules with 12 Lessons
  // Module 1
  const mod1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 1: Foundations of Modern AI & Neural Architecture",
      description: "Understand the mathematical intuition, history, and computational foundations of Artificial Intelligence.",
      position: 1,
      lessons: {
        create: [
          {
            title: "The Modern AI Landscape: From Expert Systems to Deep Learning",
            slug: "ai-landscape-foundations",
            type: LessonType.VIDEO,
            durationSec: 18 * 60,
            position: 1,
            videoUrl: sampleVideo1,
            content: "Explore the evolution of computational AI: symbolic reasoning, perceptrons, multi-layer networks, and foundation models.",
            isPreview: true,
          },
          {
            title: "Mathematical Foundations: Linear Algebra, Loss Landscapes & Gradient Descent",
            slug: "linear-algebra-gradient-descent",
            type: LessonType.READING,
            durationSec: 14 * 60,
            position: 2,
            content: "Detailed deep-dive into vectors, tensors, partial derivatives, chain rule backpropagation, and stochastic gradient descent (SGD).",
          },
          {
            title: "Foundations of Modern AI Assessment",
            slug: "ai-foundations-quiz",
            type: LessonType.QUIZ,
            durationSec: 15 * 60,
            position: 3,
            content: "Timed conceptual quiz testing loss functions, learning rate schedules, and tensor dimensions.",
          },
        ],
      },
    },
    include: { lessons: true },
  })

  // Module 2
  const mod2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 2: Deep Neural Networks & Computer Vision with PyTorch",
      description: "Hands-on implementation of deep feed-forward networks, convolutional filters, and vision transformers.",
      position: 2,
      lessons: {
        create: [
          {
            title: "Building & Training Multi-Layer Perceptrons in PyTorch",
            slug: "pytorch-mlp-training",
            type: LessonType.VIDEO,
            durationSec: 26 * 60,
            position: 1,
            videoUrl: sampleVideo2,
            content: "Step-by-step code tutorial: torch.nn, autograd, forward pass, cross-entropy loss, and Adam optimizer.",
          },
          {
            title: "Convolutional Neural Networks (CNNs) & Feature Extraction",
            slug: "cnn-vision-transformers",
            type: LessonType.VIDEO,
            durationSec: 30 * 60,
            position: 2,
            videoUrl: sampleVideo3,
            content: "Spatial convolutions, pooling layers, ResNet architectures, and modern Vision Transformers (ViT).",
          },
          {
            title: "Hands-on Lab: PyTorch Image Classification Pipeline with Transfer Learning",
            slug: "pytorch-transfer-learning-lab",
            type: LessonType.ASSIGNMENT,
            durationSec: 45 * 60,
            position: 3,
            content: "Practical coding assignment: fine-tune a pre-trained ResNet-50 model on a custom medical imaging dataset.",
          },
        ],
      },
    },
    include: { lessons: true },
  })

  // Module 3
  const mod3 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 3: Natural Language Processing & Transformer Architecture",
      description: "Inside the Transformer revolution: Self-Attention, Positional Encodings, and Large Language Models.",
      position: 3,
      lessons: {
        create: [
          {
            title: "Attention Is All You Need: Deconstructing Self-Attention & Multi-Head Attention",
            slug: "transformer-self-attention",
            type: LessonType.VIDEO,
            durationSec: 34 * 60,
            position: 1,
            videoUrl: sampleVideo1,
            content: "Query, Key, Value matrices, scaled dot-product attention, multi-head projections, and residual connections.",
          },
          {
            title: "Tokenization Algorithms, Vector Space Geometry & Embeddings",
            slug: "tokenization-embeddings",
            type: LessonType.READING,
            durationSec: 16 * 60,
            position: 2,
            content: "Byte-Pair Encoding (BPE), SentencePiece, cosine similarity in high-dimensional vector spaces.",
          },
          {
            title: "Fine-Tuning Open-Source LLMs (Llama 3 & Mistral) with PEFT / LoRA",
            slug: "llm-lora-finetuning",
            type: LessonType.VIDEO,
            durationSec: 38 * 60,
            position: 3,
            videoUrl: sampleVideo2,
            content: "Low-Rank Adaptation (LoRA), QLoRA 4-bit quantization, Hugging Face TRL, and SFTTrainer for domain alignment.",
          },
        ],
      },
    },
    include: { lessons: true },
  })

  // Module 4
  const mod4 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 4: Generative AI, RAG Systems & Autonomous Agents",
      description: "Design production-grade Retrieval-Augmented Generation (RAG) and stateful multi-agent systems.",
      position: 4,
      lessons: {
        create: [
          {
            title: "Production Retrieval-Augmented Generation (RAG) Architecture",
            slug: "production-rag-architecture",
            type: LessonType.VIDEO,
            durationSec: 32 * 60,
            position: 1,
            videoUrl: sampleVideo3,
            content: "Hierarchical chunking strategies, dense vs sparse retrieval (BM25 + ColBERT), rerankers, and citation synthesis.",
          },
          {
            title: "Vector Databases, Dense Embeddings & Hybrid Search at Scale",
            slug: "vector-db-hybrid-search",
            type: LessonType.VIDEO,
            durationSec: 28 * 60,
            position: 2,
            videoUrl: sampleVideo1,
            content: "HNSW graphs, Pinecone / Milvus / Qdrant indexing, and metadata filtering in enterprise pipelines.",
          },
          {
            title: "Capstone Project: Building an Autonomous Multi-Agent Research System with LangGraph",
            slug: "autonomous-agents-project",
            type: LessonType.ASSIGNMENT,
            durationSec: 60 * 60,
            position: 3,
            content: "Develop a coordinated multi-agent workflow featuring planner, web research, summarizer, and evaluator agents.",
          },
        ],
      },
    },
    include: { lessons: true },
  })

  // Module 5
  const mod5 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 5: MLOps, Model Serving & Enterprise AI Certification",
      description: "Scale AI inference in Kubernetes with vLLM, TensorRT-LLM, and take the certification exam.",
      position: 5,
      lessons: {
        create: [
          {
            title: "High-Throughput Model Serving with vLLM, PagedAttention & Quantization",
            slug: "vllm-serving-mlops",
            type: LessonType.VIDEO,
            durationSec: 25 * 60,
            position: 1,
            videoUrl: sampleVideo2,
            content: "PagedAttention memory optimization, continuous batching, AWQ/GGUF quantization, and Kubernetes auto-scaling.",
          },
          {
            title: "Artificial Intelligence Professional Certification Exam",
            slug: "ai-certification-exam",
            type: LessonType.QUIZ,
            durationSec: 45 * 60,
            position: 2,
            content: "Comprehensive certification assessment covering deep learning theory, transformer architectures, and RAG design.",
          },
        ],
      },
    },
    include: { lessons: true },
  })

  const firstLesson = mod1.lessons[0]

  // 3. Connect Live Class
  await prisma.liveClass.updateMany({
    where: { courseId: course.id },
    data: {
      title: "Artificial Intelligence Masterclass — Foundations & Architecture",
      description: "Interactive live cohort lecture with Faculty Instructor covering modern AI architectures, Transformers, and Q&A.",
      meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
      timezone: "Asia/Kolkata",
    },
  })

  // 4. Update student enrollments to point to first lesson
  await prisma.enrollment.updateMany({
    where: { courseId: course.id },
    data: {
      lastLessonId: firstLesson.id,
      status: "ACTIVE",
    },
  })

  // 5. Create Assignments for this course if not existing
  const existingAssign = await prisma.assignment.findFirst({
    where: { courseId: course.id },
  })

  if (!existingAssign) {
    await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: "Building an Autonomous Multi-Agent Research System with LangGraph",
        instructions: "Architect and implement a stateful multi-agent research pipeline in Python using LangGraph. Your system must take a research prompt, orchestrate parallel research agents, perform vector store lookups, and synthesize a structured markdown report.\n\nEvaluation Rubric:\n- Agent State Management & Graph Flow (30 pts)\n- Tool Integration & Vector Search (30 pts)\n- Error Handling & Fallbacks (20 pts)\n- Code Cleanliness & Documentation (20 pts)",
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxMarks: 100,
        attachments: [
          "https://github.com/techgration/ai-multi-agent-starter",
        ],
      },
    })

    await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: "PyTorch Image Classification Pipeline with Transfer Learning",
        instructions: "Fine-tune a pre-trained ResNet or Vision Transformer model on a custom dataset. Implement custom data loaders, data augmentations, learning rate warmups, and log training loss/validation metrics.\n\nEvaluation Rubric:\n- Model Architecture & Pre-trained weights (25 pts)\n- Data Augmentation & Preprocessing (25 pts)\n- Validation Accuracy > 90% (30 pts)\n- Inference script & documentation (20 pts)",
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxMarks: 100,
        attachments: [
          "https://github.com/techgration/pytorch-vision-starter",
        ],
      },
    })
  }

  // 6. Create Assessment / Quiz for this course if not existing
  const existingAssess = await prisma.assessment.findFirst({
    where: { courseId: course.id },
  })

  if (!existingAssess) {
    await prisma.assessment.create({
      data: {
        courseId: course.id,
        title: "Foundations of Modern AI & Neural Networks Quiz",
        description: "Timed scenario assessment testing core concepts in gradient descent, convolutional feature maps, self-attention mechanisms, and vector databases.",
        timeLimitSec: 1800,
        passingPct: 70,
        questions: {
          create: [
            {
              prompt: "Which attention mechanism allows transformers to process input tokens in parallel rather than sequentially?",
              type: QuestionType.MCQ_SINGLE,
              points: 10,
              position: 1,
              explanation: "Scaled Dot-Product Self-Attention operates across all token vectors concurrently via Q, K, V matrix multiplications.",
              options: {
                create: [
                  { label: "Recurrent Hidden State Passing", isCorrect: false, position: 1 },
                  { label: "Scaled Dot-Product Self-Attention", isCorrect: true, position: 2 },
                  { label: "Markov Decision Chains", isCorrect: false, position: 3 },
                  { label: "Convolutional Pooling Filters", isCorrect: false, position: 4 },
                ],
              },
            },
            {
              prompt: "In Low-Rank Adaptation (LoRA), how are trainable parameters reduced during fine-tuning?",
              type: QuestionType.MCQ_SINGLE,
              points: 10,
              position: 2,
              explanation: "LoRA freezes the pre-trained weights W and injects trainable rank decomposition matrices A and B (delta W = B * A).",
              options: {
                create: [
                  { label: "By freezing original weights and decomposing weight updates into two low-rank matrices (A and B)", isCorrect: true, position: 1 },
                  { label: "By pruning 90% of the model's layers", isCorrect: false, position: 2 },
                  { label: "By quantizing all activation matrices to 1-bit binary values", isCorrect: false, position: 3 },
                  { label: "By eliminating attention heads entirely", isCorrect: false, position: 4 },
                ],
              },
            },
            {
              prompt: "What is the primary role of a Reranker in a modern Hybrid Retrieval-Augmented Generation (RAG) system?",
              type: QuestionType.MCQ_SINGLE,
              points: 10,
              position: 3,
              explanation: "A cross-encoder reranker computes joint token interactions between query and candidate passages to provide high-precision semantic rankings.",
              options: {
                create: [
                  { label: "To compute precise cross-encoder relevance scores for top candidate chunks before feeding to the LLM context", isCorrect: true, position: 1 },
                  { label: "To generate image embeddings for OCR documents", isCorrect: false, position: 2 },
                  { label: "To compress vector indices on disk", isCorrect: false, position: 3 },
                  { label: "To replace tokenization algorithms", isCorrect: false, position: 4 },
                ],
              },
            },
          ],
        },
      },
    })
  }

  console.log("✅ AI Course Enrichment complete!")
  console.log(`Course: ${course.title} (ID: ${course.id})`)
  console.log(`Modules created: 5 | Lessons created: 14`)
  console.log(`First Lesson ID: ${firstLesson.id}`)
}

main()
  .catch((e) => {
    console.error("❌ Enrichment failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
