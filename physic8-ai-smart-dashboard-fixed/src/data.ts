import { Lesson, DailyFact, Question } from './types';

export const PHYSICS_LESSONS: Lesson[] = [
  {
    id: 'bai-1',
    title: 'Chuyển động cơ học',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Tìm hiểu sự thay đổi vị trí của một vật theo thời gian so với vật mốc.',
    objectives: [
      'Nêu được thế nào là chuyển động cơ học và vật mốc.',
      'Lấy được ví dụ về chuyển động cơ học trong đời sống.',
      'Hiểu rõ tính tương đối của chuyển động và đứng yên.'
    ],
    theory: [
      'Sự thay đổi vị trí của một vật theo thời gian so với vật khác (gọi là vật mốc) được gọi là chuyển động cơ học.',
      'Nếu vật không thay đổi vị trí của nó so với vật mốc thì vật đó được gọi là đứng yên.',
      'Chuyển động và đứng yên có tính tương đối tùy thuộc vào vật được chọn làm mốc. Một vật có thể là chuyển động đối với vật mốc này nhưng lại là đứng yên đối với vật mốc khác.',
      'Các dạng chuyển động thường gặp là: chuyển động thẳng, chuyển động cong và chuyển động tròn (một dạng đặc biệt của chuyển động cong).'
    ],
    formulas: [],
    examples: [
      {
        question: 'Một hành khách ngồi trên một toa tàu đang rời ga. So với nhà ga thì hành khách chuyển động hay đứng yên? Còn so với toa tàu thì sao?',
        solution: 'So với nhà ga, vị trí của hành khách đang thay đổi theo thời gian, nên hành khách chuyển động. So với toa tàu, vị trí của hành khách không thay đổi theo thời gian, nên hành khách đứng yên. Điều này thể hiện tính tương đối của chuyển động.',
        answer: 'Chuyển động so với nhà ga; Đứng yên so với toa tàu.'
      }
    ],
    applications: [
      'Xác định hành trình di chuyển của phương tiện giao thông (chọn mặt đường làm mốc).',
      'Công nghệ định vị toàn cầu GPS tính vận tốc và quãng đường dựa trên vật mốc cố định.'
    ],
    difficulty: 'Dễ'
  },
  {
    id: 'bai-2',
    title: 'Vận tốc',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Đại lượng vật lý đặc trưng cho mức độ nhanh hay chậm của chuyển động.',
    objectives: [
      'Nêu được ý nghĩa của vận tốc và công thức tính vận tốc.',
      'Đổi được đơn vị vận tốc m/s và km/h.',
      'Giải bài tập tính vận tốc, quãng đường, thời gian.'
    ],
    theory: [
      'Độ lớn của vận tốc cho biết mức độ nhanh hay chậm của chuyển động và được xác định bằng quãng đường đi được trong một đơn vị thời gian.',
      'Đơn vị hợp pháp của vận tốc là mét trên giây (m/s) và kilômét trên giờ (km/h). Mối liên hệ: 1 m/s = 3.6 km/h hoặc 1 km/h = 1/3.6 m/s ≈ 0.28 m/s.',
      'Trong chuyển động không đều, vận tốc trung bình trên một quãng đường được tính bằng tổng quãng đường chia cho tổng thời gian đi hết quãng đường đó.'
    ],
    formulas: [
      {
        name: 'Công thức tính vận tốc',
        expression: 'v = s / t',
        variables: [
          'v: Vận tốc (m/s hoặc km/h)',
          's: Quãng đường đi được (m hoặc km)',
          't: Thời gian đi hết quãng đường đó (s hoặc h)'
        ],
        description: 'Dùng để tìm tốc độ của một chuyển động đều, hoặc tính tốc độ trung bình trong chuyển động không đều.'
      },
      {
        name: 'Công thức tính vận tốc trung bình',
        expression: 'v_tb = (s1 + s2 + ...) / (t1 + t2 + ...)',
        variables: [
          'v_tb: Vận tốc trung bình (m/s hoặc km/h)',
          's1, s2: Quãng đường các chặng khác nhau',
          't1, t2: Thời gian đi các chặng tương ứng'
        ],
        description: 'Chú ý: Tuyệt đối không tính trung bình cộng các vận tốc trực tiếp (v_tb ≠ (v1 + v2)/2).'
      }
    ],
    examples: [
      {
        question: 'Một người đi xe máy đi được quãng đường 15km trong thời gian 30 phút. Tính vận tốc của xe máy theo m/s và km/h?',
        solution: 'Đổi: 15km = 15000m; 30 phút = 0.5 giờ = 1800 giây.\n- Vận tốc theo km/h: v = s / t = 15 / 0.5 = 30 km/h.\n- Vận tốc theo m/s: v = 15000 / 1800 = 8.33 m/s (Hoặc lấy 30 / 3.6 = 8.33 m/s).',
        answer: '30 km/h và 8.33 m/s.'
      }
    ],
    applications: [
      'Thiết kế giới hạn tốc độ trên biển báo giao thông đường bộ.',
      'Đồng hồ đo tốc độ (tốc kế) gắn trên xe máy, ô tô hiển thị vận tốc tức thời.'
    ],
    difficulty: 'Trung bình'
  },
  {
    id: 'bai-3',
    title: 'Lực và Biểu diễn lực',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Hiểu về khái niệm lực, tác dụng của lực và cách biểu diễn lực dưới dạng vectơ.',
    objectives: [
      'Nêu được lực là một đại lượng vectơ.',
      'Biết cách biểu diễn một lực bằng mũi tên với đầy đủ các yếu tố: điểm đặt, phương, chiều, độ lớn.',
      'Giải thích được tác dụng của lực làm biến đổi chuyển động hoặc biến dạng vật.'
    ],
    theory: [
      'Lực có thể làm thay đổi vận tốc của chuyển động (làm nhanh lên, chậm đi, đổi hướng) hoặc làm vật bị biến dạng.',
      'Lực là một đại lượng vectơ vì nó vừa có độ lớn, vừa có phương và chiều.',
      'Cách biểu diễn lực: Sử dụng một mũi tên có:\n+ Gốc là điểm đặt của lực.\n+ Phương và chiều trùng với phương và chiều của lực.\n+ Độ dài biểu diễn độ lớn của lực theo một tỉ xích cho trước.'
    ],
    formulas: [],
    examples: [
      {
        question: 'Biểu diễn lực kéo F tác dụng lên một chiếc xe có điểm đặt tại đầu xe, phương nằm ngang, chiều từ trái sang phải, độ lớn F = 1500N. Tỉ xích chọn 1cm ứng với 500N.',
        solution: '- Điểm đặt: Tại đầu xe tác dụng.\n- Phương: Nằm ngang.\n- Chiều: Từ trái sang phải.\n- Chiều dài mũi tên: 1500N / 500N = 3cm.\nVẽ mũi tên nằm ngang hướng sang phải dài 3 ô tập (hoặc 3cm), ký hiệu vectơ F phía trên.',
        answer: 'Vẽ mũi tên dài 3cm hướng sang phải.'
      }
    ],
    applications: [
      'Kỹ sư tính toán lực kéo của cáp treo, lực đỡ của cầu treo dây võng.',
      'Phân tích lực ma sát, lực cản gió khi thiết kế kiểu dáng khí động học cho xe đua.'
    ],
    difficulty: 'Trung bình'
  },
  {
    id: 'bai-5',
    title: 'Áp suất',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Khái niệm áp lực và áp suất tác dụng lên một bề mặt bị ép.',
    objectives: [
      'Nêu được định nghĩa áp lực và áp suất.',
      'Sử dụng công thức tính áp suất p = F/S để giải các bài toán đơn giản.',
      'Giải thích các biện pháp làm tăng, giảm áp suất trong đời sống thực tế.'
    ],
    theory: [
      'Áp lực là lực ép có phương vuông góc với mặt bị ép.',
      'Áp suất là độ lớn của áp lực trên một đơn vị diện tích bị ép.',
      'Đơn vị của áp suất là Paxcan (Pa), với 1 Pa = 1 N/m². Ngoài ra còn dùng đơn vị atm, mmHg, bar.'
    ],
    formulas: [
      {
        name: 'Công thức tính áp suất',
        expression: 'p = F / S',
        variables: [
          'p: Áp suất (N/m² hoặc Pa)',
          'F: Áp lực tác dụng vuông góc lên mặt bị ép (N)',
          'S: Diện tích bị ép (m²)'
        ],
        description: 'Công thức cơ bản áp dụng cho vật rắn ép lên mặt phẳng nâng đỡ.'
      }
    ],
    examples: [
      {
        question: 'Một người có khối lượng 50kg đứng cả hai chân trên mặt đất. Diện tích tiếp xúc của một bàn chân với đất là 150 cm². Tính áp suất người đó tác dụng lên mặt đất?',
        solution: '- Khối lượng m = 50kg => Trọng lượng (áp lực) F = P = 10 * m = 10 * 50 = 500 N.\n- Diện tích tiếp xúc của cả hai chân: S = 2 * 150 = 300 cm² = 0.03 m².\n- Áp suất tác dụng: p = F / S = 500 / 0.03 ≈ 16666.67 Pa.',
        answer: '16666.67 Pa.'
      }
    ],
    applications: [
      'Móng nhà được xây rộng hơn tường để tăng diện tích tiếp xúc S, giảm áp suất tác dụng lên nền đất tránh sụt lún.',
      'Lưỡi dao, rìu cần mài sắc (giảm diện tích S) để tăng áp suất giúp cắt vật dễ dàng.'
    ],
    difficulty: 'Trung bình'
  },
  {
    id: 'bai-8',
    title: 'Lực đẩy Ác-si-mét',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Tìm hiểu lực đẩy tác dụng lên một vật nhúng trong chất lỏng.',
    objectives: [
      'Mô tả hiện tượng về lực đẩy của chất lỏng lên vật nhúng trong nó.',
      'Phát biểu được định luật Ác-si-mét và viết công thức tính lực đẩy.',
      'Xác định các yếu tố quyết định độ lớn của lực đẩy Ác-si-mét.'
    ],
    theory: [
      'Một vật nhúng trong chất lỏng bị chất lỏng tác dụng một lực đẩy hướng thẳng đứng từ dưới lên. Lực này gọi là lực đẩy Ác-si-mét.',
      'Độ lớn của lực đẩy Ác-si-mét bằng trọng lượng của phần chất lỏng bị vật chiếm chỗ.',
      'Lực đẩy Ác-si-mét phụ thuộc vào trọng lượng riêng của chất lỏng (d) và thể tích của phần chất lỏng bị vật chiếm chỗ (V). Không phụ thuộc vào khối lượng hay chất liệu vật.'
    ],
    formulas: [
      {
        name: 'Công thức lực đẩy Ác-si-mét',
        expression: 'F_A = d * V',
        variables: [
          'F_A: Lực đẩy Ác-si-mét (N)',
          'd: Trọng lượng riêng của chất lỏng (N/m³)',
          'V: Thể tích phần chất lỏng bị vật chiếm chỗ (m³)'
        ],
        description: 'Chú ý V là thể tích phần chìm trong nước chứ không nhất thiết là toàn bộ thể tích vật.'
      }
    ],
    examples: [
      {
        question: 'Một khối sắt có thể tích 2 dm³ được nhúng chìm hoàn toàn trong nước. Tính lực đẩy Ác-si-mét tác dụng lên khối sắt biết trọng lượng riêng của nước d = 10000 N/m³?',
        solution: 'Đổi: V = 2 dm³ = 0.002 m³.\nÁp dụng công thức: F_A = d * V = 10000 * 0.002 = 20 N.',
        answer: '20 N.'
      }
    ],
    applications: [
      'Chế tạo tàu thủy khổng lồ bằng thép vẫn nổi trên mặt nước nhờ thể tích V rỗng rất lớn làm lực đẩy FA lớn hơn trọng lượng tàu.',
      'Tàu ngầm thay đổi lượng nước trong các khoang chứa để điều chỉnh trọng lượng, giúp tàu lặn xuống hoặc nổi lên.'
    ],
    difficulty: 'Khó'
  },
  {
    id: 'bai-10',
    title: 'Công cơ học và Công suất',
    chapter: 'Cơ học',
    chapterId: 1,
    summary: 'Định nghĩa công cơ học, điều kiện có công và đại lượng đo tốc độ thực hiện công.',
    objectives: [
      'Nêu được hai điều kiện để có công cơ học.',
      'Sử dụng công thức A = F.s và P = A/t để làm các bài tập ứng dụng.',
      'Hiểu rõ ý nghĩa đơn vị Jun (J) và Oát (W).'
    ],
    theory: [
      'Thuật ngữ công cơ học chỉ dùng khi có lực tác dụng vào vật làm vật dịch chuyển.',
      'Hai yếu tố quyết định công cơ học là: Lực tác dụng F và quãng đường dịch chuyển s theo phương của lực.',
      'Công suất là đại lượng đặc trưng cho tốc độ thực hiện công, được xác định bằng công thực hiện được trong một đơn vị thời gian.'
    ],
    formulas: [
      {
        name: 'Công thức tính công cơ học',
        expression: 'A = F * s',
        variables: [
          'A: Công cơ học (Jun, kí hiệu là J)',
          'F: Lực tác dụng vào vật (N)',
          's: Quãng đường vật dịch chuyển theo hướng của lực (m)'
        ],
        description: 'Nếu vật dịch chuyển theo phương vuông góc với phương của lực thì công của lực đó bằng 0.'
      },
      {
        name: 'Công thức tính công suất',
        expression: 'P = A / t',
        variables: [
          'P: Công suất (Oát, kí hiệu là W)',
          'A: Công thực hiện được (J)',
          't: Thời gian thực hiện công đó (s)'
        ],
        description: 'Trong kỹ thuật có thể dùng đơn vị Mã lực (HP): 1 HP ≈ 746W.'
      }
    ],
    examples: [
      {
        question: 'Một con ngựa kéo một chiếc xe đi đều với lực kéo F = 200N trên quãng đường 5km trong thời gian 25 phút. Tính công thực hiện và công suất của con ngựa?',
        solution: 'Đổi: s = 5km = 5000m; t = 25 phút = 1500s.\n- Công thực hiện: A = F * s = 200 * 5000 = 1,000,000 J = 1 MJ.\n- Công suất của ngựa: P = A / t = 1,000,000 / 1500 ≈ 666.67 W.',
        answer: 'Công: 1,000,000 J; Công suất: 666.67 W.'
      }
    ],
    applications: [
      'Đánh giá hiệu năng động cơ xe máy, máy bơm nước qua thông số công suất ghi trên nhãn máy.',
      'Tính năng lượng tiêu thụ của các thiết bị nâng hạ trong công nghiệp.'
    ],
    difficulty: 'Khó'
  },
  {
    id: 'bai-18',
    title: 'Phương trình cân bằng nhiệt',
    chapter: 'Nhiệt học',
    chapterId: 2,
    summary: 'Nguyên lý truyền nhiệt và phương trình thể hiện sự bảo toàn năng lượng trong trao đổi nhiệt.',
    objectives: [
      'Phát biểu được 3 nguyên lý truyền nhiệt.',
      'Viết được phương trình cân bằng nhiệt Q_tỏa = Q_thu.',
      'Giải được các bài toán trao đổi nhiệt giữa hai hoặc nhiều vật.'
    ],
    theory: [
      'Nhiệt tự truyền từ vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn.',
      'Sự truyền nhiệt xảy ra cho đến khi nhiệt độ của hai vật bằng nhau thì dừng lại (đạt cân bằng nhiệt).',
      'Nhiệt lượng do vật này tỏa ra bằng nhiệt lượng do vật kia thu vào (bảo toàn nhiệt năng).'
    ],
    formulas: [
      {
        name: 'Công thức tính nhiệt lượng',
        expression: 'Q = m * c * Δt',
        variables: [
          'Q: Nhiệt lượng thu vào hoặc tỏa ra (J)',
          'm: Khối lượng của vật (kg)',
          'c: Nhiệt dung riêng của chất cấu tạo nên vật (J/kg.K)',
          'Δt: Độ thay đổi nhiệt độ (t_sau - t_đầu đối với thu, hoặc t_đầu - t_sau đối với tỏa)'
        ],
        description: 'Nhiệt dung riêng c đặc trưng cho khả năng hấp thụ nhiệt lượng của mỗi chất.'
      },
      {
        name: 'Phương trình cân bằng nhiệt',
        expression: 'Q_tỏa = Q_thu',
        variables: [
          'Q_tỏa: Nhiệt lượng tỏa ra từ vật nóng',
          'Q_thu: Nhiệt lượng thu vào của vật lạnh'
        ],
        description: 'm1 * c1 * (t1 - t_cb) = m2 * c2 * (t_cb - t2)'
      }
    ],
    examples: [
      {
        question: 'Rót 2kg nước ở nhiệt độ 80°C vào một bình chứa 1kg nước ở 20°C. Tính nhiệt độ cuối cùng khi có cân bằng nhiệt? (Bỏ qua sự truyền nhiệt cho vỏ bình và môi trường).',
        solution: 'Gọi nhiệt độ cân bằng là t.\n- Nhiệt lượng nước nóng tỏa ra: Q_tỏa = m1 * c * (t1 - t) = 2 * c * (80 - t)\n- Nhiệt lượng nước lạnh thu vào: Q_thu = m2 * c * (t - t2) = 1 * c * (t - 20)\nVì Q_tỏa = Q_thu nên:\n2 * c * (80 - t) = 1 * c * (t - 20)\n=> 2 * (80 - t) = t - 20\n=> 160 - 2t = t - 20 => 3t = 180 => t = 60°C.',
        answer: '60°C.'
      }
    ],
    applications: [
      'Thiết kế hệ thống làm mát bằng nước cho động cơ ô tô xe máy.',
      'Tính toán và điều chỉnh nhiệt độ phòng tắm, bể bơi công cộng bằng cách pha nước nóng và nước lạnh.'
    ],
    difficulty: 'Khó'
  }
];

export const PHYSICS_FUN_FACTS: DailyFact[] = [
  {
    title: 'Tại sao tàu làm bằng thép lại nổi?',
    content: 'Mặc dù thép nặng hơn nước, tàu thủy nổi được nhờ cấu tạo rỗng lớn bên trong. Điều này giúp thể tích phần chìm tăng lên cực lớn, tạo ra lực đẩy Ác-si-mét lớn hơn cả trọng lượng toàn bộ con tàu.',
    author: 'Định luật Ác-si-mét'
  },
  {
    title: 'Giọt nước tròn xoe trong không gian',
    content: 'Trong môi trường không trọng lực của trạm vũ trụ ISS, lực căng bề mặt kéo các phân tử nước sát lại với nhau hết mức có thể, khiến chúng tự động gom lại thành những quả cầu nước lơ lửng hoàn hảo!',
    author: 'Vật lí Hiện đại'
  },
  {
    title: 'Nhiệt dung riêng vô địch của Nước',
    content: 'Nước có nhiệt dung riêng rất cao (~4200 J/kg.K), cao hơn hầu hết các chất lỏng và kim loại khác. Chính vì vậy nước giữ nhiệt rất tốt và được ứng dụng để điều hòa khí hậu toàn cầu và làm mát động cơ.',
    author: 'Nhiệt học'
  },
  {
    title: 'Áp suất khí quyển khổng lồ',
    content: 'Chúng ta đang sống dưới đáy một đại dương không khí dày hàng chục km. Áp suất khí quyển ép lên cơ thể chúng ta bằng trọng lượng của một chiếc ô tô nhỏ (~100.000 Pa). Nhưng chúng ta không bị bẹp vì áp suất bên trong cơ thể bằng đúng áp suất khí quyển bên ngoài.',
    author: 'Khí quyển học'
  }
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    questionText: 'Khi nói chuyển động hay đứng yên có tính tương đối, điều này có nghĩa là gì?',
    options: [
      'Vì vật không thể tự chuyển động được.',
      'Vì chuyển động phụ thuộc vào việc lựa chọn vật mốc.',
      'Vì mọi vật trong tự nhiên đều chuyển động không ngừng.',
      'Vì khoảng cách của vật đến vật mốc luôn luôn đổi.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Chuyển động có tính tương đối vì một vật có thể là chuyển động đối với vật mốc này nhưng đứng yên đối với vật mốc khác tùy thuộc vào vật chọn làm mốc.',
    points: 2
  },
  {
    id: 'q2',
    questionText: 'Một chiếc ô tô di chuyển quãng đường 90km hết 1.5 giờ. Vận tốc của chiếc ô tô đó là bao nhiêu?',
    options: [
      '45 km/h',
      '50 km/h',
      '60 km/h',
      '135 km/h'
    ],
    correctAnswerIndex: 2,
    explanation: 'Áp dụng công thức v = s / t = 90 / 1.5 = 60 km/h.',
    points: 2
  },
  {
    id: 'q3',
    questionText: 'Đơn vị đo áp suất hợp pháp trong hệ đo lường SI là gì?',
    options: [
      'N/m (Niutơn trên mét)',
      'Pa (Paxcan) hoặc N/m²',
      'kg/m³ (Kilôgam trên mét khối)',
      'J (Jun)'
    ],
    correctAnswerIndex: 1,
    explanation: 'Đơn vị đo áp suất là Paxcan (Pa) hoặc Niutơn trên mét vuông (N/m²). 1 Pa = 1 N/m².',
    points: 2
  },
  {
    id: 'q4',
    questionText: 'Nếu một vật nổi lơ lửng trong nước thì lực đẩy Ác-si-mét tác dụng lên vật có mối quan hệ gì với trọng lượng vật?',
    options: [
      'F_A > P',
      'F_A < P',
      'F_A = P',
      'Không thể so sánh được vì thiếu dữ kiện d_nước'
    ],
    correctAnswerIndex: 2,
    explanation: 'Khi vật nổi lơ lửng trong lòng chất lỏng hoặc nổi trên mặt chất lỏng, lực đẩy Ác-si-mét cân bằng với trọng lượng của vật, tức là F_A = P.',
    points: 2
  },
  {
    id: 'q5',
    questionText: 'Trường hợp nào dưới đây có công cơ học?',
    options: [
      'Học sinh đang ngồi đọc bài rất say sưa trong lớp.',
      'Người lực sĩ cử tạ nâng quả tạ và đang đứng yên giữ tạ trên cao.',
      'Một chiếc lá bàng đang rơi tự do từ trên cành cây xuống đất dưới tác dụng của trọng lực.',
      'Móng nhà kiên cố đang đỡ toàn bộ khối lượng ngôi nhà.'
    ],
    correctAnswerIndex: 2,
    explanation: 'Công cơ học xuất hiện khi có lực tác dụng làm vật dịch chuyển. Khi chiếc lá bàng rơi từ trên cao xuống đất, trọng lực tác dụng làm lá rơi (dịch chuyển) nên trọng lực thực hiện công.',
    points: 2
  }
];
