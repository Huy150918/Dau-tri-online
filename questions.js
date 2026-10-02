// Đáp án đúng luôn ở vị trí đầu tiên trong "a"; server sẽ xáo trộn khi tạo ván.
const crypto = require('crypto');
// Fisher–Yates dùng crypto.randomInt (ngẫu nhiên mật mã học, không thiên lệch)
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}

const VN = [
  {q:"Sông Cửu Long là tên gọi của đoạn hạ lưu của con sông nào?", a:["Sông Mê Công","Sông Hồng","Sông Đồng Nai","Sông Mã"]},
  {q:"Hang Sơn Đoòng, một trong những hang động lớn nhất thế giới, nằm trong vườn quốc gia nào?", a:["Phong Nha – Kẻ Bàng","Cúc Phương","Cát Tiên","Bạch Mã"]},
  {q:"Tác phẩm “Truyện Kiều” do ai sáng tác?", a:["Nguyễn Du","Nguyễn Trãi","Hồ Xuân Hương","Nguyễn Đình Chiểu"]},
  {q:"Đồng bằng lớn nhất Việt Nam là?", a:["Đồng bằng sông Cửu Long","Đồng bằng sông Hồng","Đồng bằng Thanh Hóa","Đồng bằng Phú Yên"]},
  {q:"Đảo lớn nhất của Việt Nam là?", a:["Phú Quốc","Cát Bà","Côn Đảo","Lý Sơn"]},
  {q:"Chùa Một Cột (chùa Diên Hựu) nổi tiếng nằm ở thành phố nào?", a:["Hà Nội","Huế","Hải Phòng","Đà Nẵng"]},
  {q:"Ngày Quốc khánh của Việt Nam là ngày nào?", a:["2/9","30/4","19/5","27/7"]},
  {q:"Giỗ Tổ Hùng Vương được tổ chức vào ngày nào âm lịch?", a:["10/3","15/1","5/5","15/8"]},
  {q:"Dãy núi nào dài nhất Việt Nam?", a:["Trường Sơn","Hoàng Liên Sơn","Con Voi","Pu Đen Đinh"]},
  {q:"Món bún chả nổi tiếng gắn liền với thành phố nào?", a:["Hà Nội","Huế","Đà Nẵng","TP. Hồ Chí Minh"]}
];
const WORLD = [
  {q:"Hành tinh nào lớn nhất Hệ Mặt Trời?", a:["Sao Mộc","Sao Thổ","Sao Hải Vương","Trái Đất"]},
  {q:"Con sông dài nhất châu Phi là?", a:["Sông Nile","Sông Congo","Sông Niger","Sông Zambezi"]},
  {q:"Thế vận hội Mùa hè 2024 được tổ chức tại thành phố nào?", a:["Paris","Tokyo","Los Angeles","London"]},
  {q:"Quốc gia nào có diện tích lớn nhất thế giới?", a:["Nga","Canada","Trung Quốc","Mỹ"]},
  {q:"Kim tự tháp Giza nổi tiếng nằm ở quốc gia nào?", a:["Ai Cập","Mexico","Sudan","Jordan"]},
  {q:"Ký hiệu hóa học “Au” là của nguyên tố nào?", a:["Vàng","Bạc","Nhôm","Đồng"]},
  {q:"Đội tuyển nào vô địch FIFA World Cup 2022?", a:["Argentina","Pháp","Brazil","Croatia"]},
  {q:"Sa mạc nóng lớn nhất thế giới là?", a:["Sahara","Gobi","Kalahari","Ả Rập"]},
  {q:"Đại dương nào lớn nhất thế giới?", a:["Thái Bình Dương","Đại Tây Dương","Ấn Độ Dương","Bắc Băng Dương"]}
];
const FINAL = [
  {q:"Vua Quang Trung đại phá quân Thanh vào mùa xuân năm nào?", a:["1789","1788","1802","1771"]},
  {q:"Việt Nam trở thành thành viên chính thức của ASEAN vào năm nào?", a:["1995","1989","1998","2007"]},
  {q:"Vua Lý Thái Tổ dời đô từ Hoa Lư ra Thăng Long vào năm nào?", a:["1010","938","1054","1428"]},
  {q:"Vịnh Hạ Long được UNESCO công nhận là Di sản thiên nhiên thế giới lần đầu vào năm nào?", a:["1994","1993","2000","2003"]},
  {q:"Đỉnh Fansipan, “nóc nhà Đông Dương”, cao khoảng bao nhiêu mét?", a:["3.143 m","2.711 m","3.429 m","2.456 m"]},
  {q:"Nhà Nguyễn, triều đại phong kiến cuối cùng của Việt Nam, được thành lập năm nào?", a:["1802","1428","1009","1884"]},
  {q:"Thủ đô của Úc là thành phố nào?", a:["Canberra","Sydney","Melbourne","Perth"]},
  {q:"Đỉnh Everest nằm trên biên giới giữa Nepal và nước nào?", a:["Trung Quốc","Ấn Độ","Bhutan","Pakistan"]},
  {q:"Chiến thắng Điện Biên Phủ “lừng lẫy năm châu, chấn động địa cầu” diễn ra năm nào?", a:["1954","1945","1968","1975"]}
];

// =====================================================================
//  NGÂN HÀNG CÂU HỎI MỞ RỘNG (sinh học thực vật, hóa học, khoa học tự nhiên,
//  dân gian, vật lý – thiên văn, lịch sử, văn hóa, tin học, địa lý...)
// =====================================================================
const BOTANY = [
  {q:"Quá trình cây xanh tạo chất hữu cơ từ CO₂ và nước nhờ ánh sáng gọi là?", a:["Quang hợp","Hô hấp","Thoát hơi nước","Nảy mầm"]},
  {q:"Bào quan thực hiện quang hợp ở tế bào thực vật là?", a:["Lục lạp","Ty thể","Ribôxôm","Không bào"]},
  {q:"Sắc tố chính hấp thụ ánh sáng trong quang hợp là?", a:["Diệp lục","Carôten","Xantôphyl","Anthocyanin"]},
  {q:"Khí cây xanh hấp thụ chủ yếu để quang hợp là?", a:["CO₂","O₂","N₂","H₂"]},
  {q:"Khí oxi thải ra trong quang hợp có nguồn gốc từ chất nào?", a:["Nước","CO₂","Glucôzơ","Diệp lục"]},
  {q:"Mô nào vận chuyển nước và muối khoáng từ rễ lên lá?", a:["Mạch gỗ","Mạch rây","Biểu bì","Mô mềm"]},
  {q:"Mạch rây chủ yếu vận chuyển chất gì?", a:["Chất hữu cơ (đường)","Nước","Muối khoáng","Khí oxi"]},
  {q:"Khí khổng ở đa số cây thường tập trung nhiều nhất ở đâu?", a:["Mặt dưới của lá","Mặt trên của lá","Rễ","Thân gỗ"]},
  {q:"Lúa, ngô, tre thuộc lớp thực vật nào?", a:["Một lá mầm","Hai lá mầm","Hạt trần","Dương xỉ"]},
  {q:"Tre, lúa, mía thuộc họ thực vật nào?", a:["Hòa thảo","Đậu","Cúc","Hoa hồng"]},
  {q:"Hoa là cơ quan sinh sản của nhóm thực vật nào?", a:["Hạt kín","Rêu","Dương xỉ","Tảo"]},
  {q:"Hiện tượng hạt phấn rơi lên đầu nhụy gọi là?", a:["Thụ phấn","Thụ tinh","Nảy mầm","Quang hợp"]},
  {q:"Sau khi thụ tinh, bộ phận nào của hoa phát triển thành quả?", a:["Bầu nhụy","Cánh hoa","Đài hoa","Nhị hoa"]},
  {q:"Sau khi thụ tinh, bộ phận nào của hoa phát triển thành hạt?", a:["Noãn","Bầu nhụy","Cánh hoa","Nhị hoa"]},
  {q:"Lá cây xương rồng biến thành gai chủ yếu để làm gì?", a:["Giảm mất nước","Bắt côn trùng","Quang hợp tốt hơn","Leo bám"]},
  {q:"Cây nắp ấm bắt côn trùng chủ yếu để bổ sung chất dinh dưỡng nào?", a:["Nitơ","Nước","Ánh sáng","Canxi"]},
  {q:"Bộ phận nào của rễ hút nước và muối khoáng chủ yếu?", a:["Lông hút","Chóp rễ","Mạch gỗ","Rễ phụ"]},
  {q:"Ba nguyên tố khoáng đa lượng NPK trong phân bón là?", a:["Nitơ, photpho, kali","Natri, photpho, canxi","Nitơ, phốt, kẽm","Niken, photpho, kali"]},
  {q:"Hiện tượng ngọn cây cong về phía có ánh sáng gọi là?", a:["Hướng sáng","Hướng đất","Hướng nước","Hướng hóa"]},
  {q:"Hormone thực vật nào thúc đẩy quả chín?", a:["Êtilen","Auxin","Xitôkinin","Giberelin"]},
  {q:"Cấu trúc nào có ở tế bào thực vật nhưng không có ở tế bào động vật?", a:["Thành xenlulôzơ","Ty thể","Nhân","Màng sinh chất"]},
  {q:"Dương xỉ sinh sản chủ yếu bằng gì?", a:["Bào tử","Hạt","Hoa","Củ"]},
  {q:"Cây thông thuộc nhóm thực vật nào?", a:["Hạt trần","Hạt kín","Dương xỉ","Rêu"]},
  {q:"Sắc tố nào tạo nên màu đỏ, tím ở nhiều loại hoa và quả?", a:["Anthocyanin","Diệp lục","Carôten","Xenlulôzơ"]},
  {q:"Hoa lớn nhất thế giới là hoa nào?", a:["Rafflesia","Hướng dương","Sen","Súng"]},
  {q:"Cây họ Đậu cộng sinh với vi khuẩn nốt sần giúp cố định nguyên tố nào?", a:["Nitơ","Cacbon","Lưu huỳnh","Photpho"]},
  {q:"Chất dự trữ chủ yếu trong củ khoai tây là?", a:["Tinh bột","Protein","Chất béo","Xenlulôzơ"]},
  {q:"Rêu sinh sản bằng cơ quan nào?", a:["Bào tử","Hạt","Hoa","Quả"]},
  {q:"Quá trình cây thải hơi nước qua lá gọi là?", a:["Thoát hơi nước","Quang hợp","Hô hấp","Hút khoáng"]}
];

const CHEM = [
  {q:"Công thức hóa học của nước là?", a:["H₂O","CO₂","H₂O₂","NaCl"]},
  {q:"Công thức hóa học của muối ăn là?", a:["NaCl","KCl","CaCO₃","NaOH"]},
  {q:"Độ pH của nước tinh khiết ở 25°C xấp xỉ bằng?", a:["7","0","14","1"]},
  {q:"Khí chiếm tỉ lệ lớn nhất trong không khí là?", a:["Nitơ","Oxi","CO₂","Argon"]},
  {q:"Khí nào duy trì sự cháy và sự hô hấp?", a:["Oxi","Nitơ","Heli","Hiđro"]},
  {q:"Axit có trong dịch vị dạ dày là?", a:["Axit clohiđric","Axit sunfuric","Axit axetic","Axit citric"]},
  {q:"Khí nào là nguyên nhân chính gây hiệu ứng nhà kính?", a:["CO₂","O₂","N₂","He"]},
  {q:"Kim loại nào ở thể lỏng ở nhiệt độ phòng?", a:["Thủy ngân","Chì","Thiếc","Bạc"]},
  {q:"Nguyên tố nhẹ nhất trong bảng tuần hoàn là?", a:["Hiđro","Heli","Liti","Cacbon"]},
  {q:"Thành phần chính của đá vôi là?", a:["Canxi cacbonat","Canxi sunfat","Natri clorua","Silic đioxit"]},
  {q:"Gỉ sắt có thành phần chủ yếu là?", a:["Oxit sắt","Muối sắt clorua","Sắt nguyên chất","Sắt sunfua"]},
  {q:"Đường mía có thành phần chính là chất nào?", a:["Saccarozơ","Glucôzơ","Fructôzơ","Tinh bột"]},
  {q:"Dung dịch bazơ làm quỳ tím chuyển sang màu gì?", a:["Xanh","Đỏ","Vàng","Không đổi màu"]},
  {q:"Axit chính có trong giấm ăn là?", a:["Axit axetic","Axit citric","Axit lactic","Axit sunfuric"]},
  {q:"Axit có nhiều trong quả chanh là?", a:["Axit xitric","Axit axetic","Axit clohiđric","Axit nitric"]},
  {q:"Kim cương và than chì đều cấu tạo từ nguyên tố nào?", a:["Cacbon","Silic","Lưu huỳnh","Photpho"]},
  {q:"Khí nào chủ yếu gây mưa axit?", a:["Lưu huỳnh đioxit","Heli","Nitơ","Argon"]},
  {q:"“Nước đá khô” thực chất là chất gì?", a:["CO₂ rắn","Nước đá","Nitơ lỏng","Băng amoniac"]},
  {q:"Số Avogadro xấp xỉ bằng?", a:["6,022 × 10²³","3,14 × 10⁸","9,81 × 10⁰","1,6 × 10⁻¹⁹"]},
  {q:"Nguyên tố phổ biến nhất trong vũ trụ là?", a:["Hiđro","Heli","Oxi","Cacbon"]},
  {q:"Chất xúc tác sinh học trong cơ thể sống là?", a:["Enzim","Hormone","Vitamin","Kháng thể"]},
  {q:"Vì sao khí heli được dùng bơm bóng bay?", a:["Nhẹ hơn không khí và không cháy","Nặng hơn không khí","Có màu đẹp","Dễ cháy"]},
  {q:"Hợp kim của đồng với thiếc gọi là gì?", a:["Đồng thanh","Đồng thau","Gang","Thép"]},
  {q:"Thép là hợp kim của sắt với nguyên tố nào là chủ yếu?", a:["Cacbon","Chì","Kẽm","Thiếc"]},
  {q:"Quá trình lên men rượu tạo ra chất nào?", a:["Etanol","Metanol","Axit axetic","Glixerol"]},
  {q:"Sục khí nào vào nước vôi trong làm nước vôi bị đục?", a:["CO₂","O₂","N₂","H₂"]},
  {q:"Chất nào sau đây là axit mạnh?", a:["H₂SO₄","CH₃COOH","H₂CO₃","H₂S"]},
  {q:"Công thức hóa học của baking soda là?", a:["NaHCO₃","Na₂CO₃","NaOH","NaCl"]},
  {q:"Thành phần chính của cát và thủy tinh là?", a:["Silic đioxit","Canxi oxit","Nhôm oxit","Sắt oxit"]},
  {q:"Khí ozon (O₃) ở tầng cao khí quyển bảo vệ Trái Đất khỏi?", a:["Tia cực tím","Tia hồng ngoại","Sóng radio","Gió Mặt Trời"]}
];

const NATURE = [
  {q:"Nước tinh khiết sôi ở bao nhiêu độ C ở áp suất khí quyển chuẩn?", a:["100°C","90°C","120°C","80°C"]},
  {q:"Tốc độ ánh sáng trong chân không xấp xỉ bao nhiêu?", a:["300.000 km/s","30.000 km/s","3.000 km/s","3.000.000 km/s"]},
  {q:"Hành tinh nào gần Mặt Trời nhất?", a:["Sao Thủy","Sao Kim","Sao Hỏa","Trái Đất"]},
  {q:"Hành tinh nào được gọi là “Hành tinh Đỏ”?", a:["Sao Hỏa","Sao Kim","Sao Mộc","Sao Thủy"]},
  {q:"Xương dài nhất trong cơ thể người là?", a:["Xương đùi","Xương chày","Xương cánh tay","Xương sống"]},
  {q:"Cơ quan lớn nhất của cơ thể người là?", a:["Da","Gan","Phổi","Ruột"]},
  {q:"Người trưởng thành có bao nhiêu xương?", a:["206","212","300","180"]},
  {q:"Tế bào nào trong máu vận chuyển oxi?", a:["Hồng cầu","Bạch cầu","Tiểu cầu","Tế bào thần kinh"]},
  {q:"Động vật chạy nhanh nhất trên cạn là?", a:["Báo săn","Sư tử","Ngựa","Linh cẩu"]},
  {q:"Động vật lớn nhất hành tinh là?", a:["Cá voi xanh","Voi châu Phi","Cá mập voi","Hươu cao cổ"]},
  {q:"Loài chim lớn nhất hiện nay, không biết bay, là?", a:["Đà điểu","Chim cánh cụt","Đại bàng","Hồng hạc"]},
  {q:"Cá heo thuộc lớp động vật nào?", a:["Thú","Cá","Lưỡng cư","Bò sát"]},
  {q:"Trái Đất quay quanh Mặt Trời một vòng mất khoảng bao lâu?", a:["365,25 ngày","30 ngày","24 giờ","12 tháng 30 ngày"]},
  {q:"Nguyên nhân chính tạo ra các mùa trên Trái Đất là?", a:["Trục Trái Đất nghiêng","Khoảng cách tới Mặt Trời","Mặt Trăng","Gió mùa"]},
  {q:"Hiện tượng thủy triều chủ yếu do lực hấp dẫn của?", a:["Mặt Trăng","Sao Hỏa","Sao Mộc","Mặt Trời"]},
  {q:"Âm thanh không truyền được trong môi trường nào?", a:["Chân không","Nước","Không khí","Thép"]},
  {q:"Đơn vị đo lực trong hệ SI là?", a:["Niutơn","Jun","Oát","Pascal"]},
  {q:"Gia tốc trọng trường trên Trái Đất xấp xỉ bao nhiêu?", a:["9,8 m/s²","1,6 m/s²","98 m/s²","3,7 m/s²"]},
  {q:"Cầu vồng có mấy màu cơ bản thường kể tên?", a:["7","5","9","3"]},
  {q:"ADN là viết tắt của?", a:["Axit đêôxiribônuclêic","Axit amin","Axit ribônuclêic","Axit béo"]},
  {q:"Cơ quan nào tiết ra insulin?", a:["Tuyến tụy","Gan","Thận","Dạ dày"]},
  {q:"Thiếu vitamin C lâu ngày gây bệnh gì?", a:["Scorbut","Còi xương","Quáng gà","Beriberi"]},
  {q:"Thiếu vitamin D ở trẻ em dễ gây bệnh gì?", a:["Còi xương","Quáng gà","Scorbut","Thiếu máu"]},
  {q:"Thiếu vitamin A dễ gây bệnh về cơ quan nào?", a:["Mắt","Xương","Tim","Da chân"]},
  {q:"Ếch con (nòng nọc) phát triển thành ếch trưởng thành qua quá trình nào?", a:["Biến thái","Phân đôi","Nảy chồi","Thụ tinh trong"]},
  {q:"Nhiệt độ đóng băng của nước ở áp suất chuẩn là?", a:["0°C","4°C","-10°C","10°C"]},
  {q:"Hiện tượng nhật thực xảy ra khi nào?", a:["Mặt Trăng che Mặt Trời","Trái Đất che Mặt Trăng","Sao Hỏa che Mặt Trời","Mặt Trời che Mặt Trăng"]},
  {q:"Sét xảy ra do hiện tượng nào?", a:["Phóng điện trong khí quyển","Va chạm của mây thường","Gió mạnh","Mưa đá"]},
  {q:"Động vật nào sau đây là loài thú đẻ trứng?", a:["Thú mỏ vịt","Dơi","Cá heo","Sóc"]},
  {q:"Ngôi sao gần Trái Đất nhất là?", a:["Mặt Trời","Sao Bắc Cực","Sirius","Proxima Centauri"]}
];

const FOLK = [
  {q:"“Chuồn chuồn bay thấp thì mưa” — chuồn chuồn bay thấp báo hiệu điều gì?", a:["Sắp mưa","Trời nắng","Trời rét","Sắp có bão tuyết"]},
  {q:"Theo ca dao, “Tháng Chạp là tháng trồng…” gì?", a:["Khoai","Đậu","Cà","Lúa"]},
  {q:"Theo ca dao, “Tháng Giêng là tháng trồng…” gì?", a:["Đậu","Khoai","Cà","Hành"]},
  {q:"Theo ca dao, “Tháng Hai trồng…” gì?", a:["Cà","Khoai","Đậu","Dưa"]},
  {q:"“Trăng quầng thì hạn, trăng tán thì mưa” — trăng quầng thường báo hiệu điều gì?", a:["Nắng hạn","Mưa to","Sương muối","Bão"]},
  {q:"“Sáo tắm thì mưa” ý nói điều gì?", a:["Chim sáo tắm báo hiệu sắp mưa","Sáo tắm báo trời nắng","Sáo ăn nhiều báo bão","Sáo bay đi báo rét"]},
  {q:"“Chớp đằng Đông, vừa trông vừa chạy” ý nói điều gì?", a:["Chớp phía Đông báo mưa sắp tới","Chớp phía Đông báo trời nắng","Chớp phía Đông báo rét","Chớp phía Đông báo lũ cuối năm"]},
  {q:"“Ăn quả nhớ kẻ trồng cây” khuyên chúng ta điều gì?", a:["Biết ơn người đã giúp mình","Ăn nhiều hoa quả","Chăm trồng cây","Không tham ăn"]},
  {q:"“Uống nước nhớ nguồn” có nghĩa là gì?", a:["Biết ơn nguồn gốc, người đi trước","Uống nước phải sạch","Phải uống đủ nước","Nên sống gần sông suối"]},
  {q:"“Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao” nói về điều gì?", a:["Sức mạnh đoàn kết","Cách trồng cây","Cách leo núi","Nên sống một mình"]},
  {q:"“Nước chảy đá mòn” khuyên chúng ta điều gì?", a:["Kiên trì sẽ thành công","Nước rất mạnh","Đá rất mềm","Không nên làm việc nặng"]},
  {q:"“Có công mài sắt có ngày nên kim” khuyên điều gì?", a:["Kiên trì chăm chỉ sẽ thành công","Nên làm đồ sắt","Cần mua kim tốt","Làm việc phải nhanh"]},
  {q:"“Đi một ngày đàng, học một sàng khôn” khuyên điều gì?", a:["Đi nhiều, trải nghiệm nhiều sẽ khôn ngoan hơn","Nên đi bộ mỗi ngày","Học phải có sàng","Đi xa rất nguy hiểm"]},
  {q:"“Lá lành đùm lá rách” khuyên chúng ta điều gì?", a:["Giúp đỡ nhau lúc khó khăn","Giữ gìn lá cây","Khâu vá quần áo","Không nên chê người khác"]},
  {q:"“Gần mực thì đen, gần đèn thì rạng” nói về điều gì?", a:["Môi trường xung quanh ảnh hưởng đến con người","Cách dùng mực","Cách thắp đèn","Màu mực và ánh sáng"]},
  {q:"“Tốt gỗ hơn tốt nước sơn” ý nói gì?", a:["Phẩm chất bên trong quan trọng hơn vẻ ngoài","Gỗ tốt giá cao","Nên sơn nhà thường xuyên","Nước sơn đắt tiền"]},
  {q:"“Chim có tổ, người có tông” nhắc chúng ta điều gì?", a:["Nhớ về nguồn cội, tổ tiên","Chim làm tổ trên cây","Mọi người đều có nhà","Nên sống đông người"]},
  {q:"“Rét tháng Ba, bà già chết cóng” nói về hiện tượng nào?", a:["Đợt rét muộn cuối xuân","Mùa hè nóng bức","Mưa bão tháng Ba","Mùa thu se lạnh"]},
  {q:"“Mau sao thì nắng, vắng sao thì mưa” — nhiều sao thường báo hiệu điều gì?", a:["Trời nắng","Trời mưa","Sắp bão","Sương mù"]},
  {q:"“Kiến cánh vỡ tổ bay ra, bão táp mưa sa gần tới” — kiến bay ra khỏi tổ báo hiệu điều gì?", a:["Sắp có mưa bão","Trời sắp nắng","Sắp rét đậm","Sắp có hạn hán"]},
  {q:"“Cày sâu bừa kỹ” là kinh nghiệm dân gian trong lĩnh vực nào?", a:["Làm ruộng, trồng trọt","Chăn nuôi","Đánh cá","Làm gốm"]},
  {q:"“Nhất nước, nhì phân, tam cần, tứ giống” nói về kinh nghiệm gì?", a:["Các yếu tố quan trọng trong trồng lúa","Nuôi gia súc","Làm vườn cây cảnh","Nấu ăn"]},
  {q:"“Tháng Tám nắng rám trái bưởi” ý nói gì?", a:["Thời điểm nắng, bưởi chín","Tháng Tám rét","Tháng Tám mưa nhiều","Cây bưởi ra hoa"]},
  {q:"“Gió heo may” thường xuất hiện vào mùa nào?", a:["Mùa thu","Mùa hè","Mùa xuân","Mùa mưa"]},
  {q:"“Mưa tháng Bảy gãy cành trám” ý nói gì?", a:["Mưa lớn, gió bão nhiều vào tháng Bảy","Tháng Bảy rất nắng","Tháng Bảy lạnh","Cây trám ra hoa vào tháng Bảy"]},
  {q:"Theo kinh nghiệm dân gian, cá nổi đầu lên mặt nước thường báo hiệu điều gì?", a:["Sắp mưa, thiếu oxi","Sắp nắng","Sắp rét","Sắp có sao băng"]},
  {q:"“Ăn cây nào rào cây ấy” có nghĩa là gì?", a:["Có lợi từ ai thì phải bảo vệ, giữ gìn cho người đó","Phải rào vườn cây","Không ăn cây lạ","Trồng cây ăn quả"]},
  {q:"“Cái nết đánh chết cái đẹp” ý nói gì?", a:["Tính nết quan trọng hơn nhan sắc","Người đẹp thường ngoan","Phải đánh người xấu","Nhan sắc là quý nhất"]},
  {q:"“Ếch kêu ồm ộp ban đêm” theo kinh nghiệm dân gian thường báo hiệu điều gì?", a:["Trời sắp mưa","Trời sắp rét","Trời nắng","Sắp có động đất"]},
  {q:"“Thuận vợ thuận chồng, tát biển Đông cũng cạn” nói lên điều gì?", a:["Sức mạnh của sự đồng lòng","Biển Đông rất nhỏ","Vợ chồng nên đi biển","Phải tát nước thường xuyên"]}
];

// ---- Sinh tự động từ bảng nguyên tố: [ký hiệu, tên, số hiệu nguyên tử] ----
const EL = [
  ["H","Hiđro",1],["He","Heli",2],["Li","Liti",3],["Be","Beri",4],["B","Bo",5],["C","Cacbon",6],
  ["N","Nitơ",7],["O","Oxi",8],["F","Flo",9],["Ne","Neon",10],["Na","Natri",11],["Mg","Magie",12],
  ["Al","Nhôm",13],["Si","Silic",14],["P","Photpho",15],["S","Lưu huỳnh",16],["Cl","Clo",17],
  ["Ar","Argon",18],["K","Kali",19],["Ca","Canxi",20],["Ti","Titan",22],["Cr","Crom",24],
  ["Mn","Mangan",25],["Fe","Sắt",26],["Ni","Niken",28],["Cu","Đồng",29],["Zn","Kẽm",30],
  ["Br","Brom",35],["Ag","Bạc",47],["Sn","Thiếc",50],["I","Iot",53],["Ba","Bari",56],
  ["W","Vonfram",74],["Pt","Bạch kim",78],["Au","Vàng",79],["Hg","Thủy ngân",80],["Pb","Chì",82],["U","Urani",92]
];
function others(e,idx){return shuffle(EL.filter(x=>x!==e)).slice(0,3).map(x=>x[idx]);}
function genElements(){
  const out=[];
  for(const e of EL){
    out.push({q:`Ký hiệu hóa học của nguyên tố ${e[1]} là?`, a:[e[0],...others(e,0)]});
    out.push({q:`Ký hiệu hóa học “${e[0]}” là của nguyên tố nào?`, a:[e[1],...others(e,1)]});
    out.push({q:`Nguyên tố có số hiệu nguyên tử ${e[2]} là?`, a:[e[1],...others(e,1)]});
  }
  return out;
}
const ELEMENTS = genElements();

const EXTRA = [...BOTANY, ...CHEM, ...NATURE, ...FOLK, ...ELEMENTS];


const BOTANY2 = [
  {q:"Cây nào sau đây là cây hạt trần?", a:["Cây tuế","Cây lúa","Cây xoài","Cây cà chua"]},
  {q:"Chất nào làm cho thành tế bào gỗ cứng chắc?", a:["Lignin","Tinh bột","Diệp lục","Đường"]},
  {q:"Vòng năm trên mặt cắt ngang thân cây gỗ cho biết điều gì?", a:["Tuổi của cây","Chiều cao của cây","Loại đất","Lượng mưa trong ngày"]},
  {q:"Rễ cây mọc hướng xuống đất là hiện tượng gì?", a:["Hướng đất","Hướng sáng","Hướng nước","Hướng hóa"]},
  {q:"Cây bí, mướp, dưa leo leo bám nhờ bộ phận nào?", a:["Tua cuốn","Rễ phụ","Gai","Vỏ thân"]},
  {q:"Hạt nảy mầm cần những điều kiện nào?", a:["Nước, không khí, nhiệt độ thích hợp","Chỉ cần ánh sáng","Chỉ cần đất màu mỡ","Chỉ cần phân bón"]},
  {q:"Cây nào sau đây có hoa đơn tính?", a:["Bí đỏ","Hoa hồng","Lúa","Cà chua"]},
  {q:"Hoa thụ phấn nhờ gió thường có đặc điểm nào?", a:["Hoa nhỏ, không sặc sỡ, nhiều phấn nhẹ","Cánh hoa to, màu rực rỡ","Có mật ngọt và hương thơm","Có tuyến mật ở đáy hoa"]},
  {q:"Lá cây có màu xanh lục vì diệp lục phản xạ ánh sáng màu nào nhiều nhất?", a:["Xanh lục","Đỏ","Xanh lam","Tím"]},
  {q:"Cây tầm gửi sống theo kiểu quan hệ nào với cây chủ?", a:["Kí sinh","Cộng sinh","Hội sinh","Hoại sinh"]},
  {q:"Địa y là kết quả cộng sinh giữa nấm và sinh vật nào?", a:["Tảo","Rêu","Dương xỉ","Vi khuẩn lam duy nhất"]},
  {q:"Nấm thuộc giới sinh vật nào?", a:["Giới Nấm","Giới Thực vật","Giới Động vật","Giới Nguyên sinh"]},
  {q:"Phần thịt đỏ ăn được của quả dâu tây phát triển từ bộ phận nào?", a:["Đế hoa","Bầu nhụy","Cánh hoa","Đài hoa"]},
  {q:"Sô cô la được làm chủ yếu từ hạt của cây nào?", a:["Ca cao","Cà phê","Chè","Điều"]},
  {q:"Hạt điều nằm ở vị trí nào so với phần cuống phình (quả giả)?", a:["Bên ngoài, ở phía dưới cuống phình","Bên trong thịt quả","Ở trên ngọn quả","Ở gốc cây"]},
  {q:"Cây thiếu nitơ thường biểu hiện như thế nào?", a:["Lá vàng nhạt, sinh trưởng kém","Lá xanh đậm bất thường","Quả to hơn bình thường","Rễ phát triển quá mức"]},
  {q:"Hormone thực vật nào kích thích hạt nảy mầm và thân vươn dài?", a:["Giberelin","Êtilen","Axit abxixic","Xitôkinin"]},
  {q:"Hormone nào giúp khí khổng đóng lại khi cây gặp hạn?", a:["Axit abxixic","Auxin","Giberelin","Êtilen"]},
  {q:"Auxin có vai trò chính nào sau đây?", a:["Kích thích giãn tế bào và ra rễ","Làm quả chín","Làm rụng lá","Ức chế quang hợp"]},
  {q:"Hô hấp ở thực vật diễn ra vào thời điểm nào?", a:["Cả ngày và đêm","Chỉ ban ngày","Chỉ ban đêm","Chỉ khi có mưa"]}
];

const CHEM2 = [
  {q:"Nhóm halogen gồm các nguyên tố nào?", a:["F, Cl, Br, I","Li, Na, K, Rb","He, Ne, Ar, Kr","O, S, Se, Te"]},
  {q:"Kim loại nào dẫn điện tốt nhất?", a:["Bạc","Đồng","Vàng","Nhôm"]},
  {q:"Kim loại nào có nhiệt độ nóng chảy cao nhất?", a:["Vonfram","Sắt","Đồng","Bạc"]},
  {q:"Kim loại phổ biến nhất trong vỏ Trái Đất là?", a:["Nhôm","Sắt","Đồng","Canxi"]},
  {q:"Nguyên tố phổ biến nhất trong vỏ Trái Đất là?", a:["Oxi","Silic","Nhôm","Sắt"]},
  {q:"Nước cứng chứa nhiều ion nào?", a:["Ca²⁺ và Mg²⁺","Na⁺ và K⁺","Cl⁻ và NO₃⁻","H⁺ và OH⁻"]},
  {q:"Phản ứng giữa axit và bazơ tạo ra gì?", a:["Muối và nước","Chỉ muối","Chỉ nước","Khí hiđro"]},
  {q:"Xút ăn da có công thức hóa học là?", a:["NaOH","KOH","HCl","Na₂CO₃"]},
  {q:"Chất nào thường dùng làm cồn sát khuẩn y tế?", a:["Etanol","Metanol","Glixerol","Axeton"]},
  {q:"Thành phần chính của khí thiên nhiên là?", a:["Metan","Etan","Propan","Hiđro"]},
  {q:"Khí nào sinh ra khi đốt than thiếu oxi, rất độc?", a:["CO","CO₂","O₂","N₂"]},
  {q:"Nước Javel (nước tẩy trắng) chứa chất nào chủ yếu?", a:["Natri hipoclorit","Natri clorua","Canxi cacbonat","Kali nitrat"]},
  {q:"Vôi sống có công thức hóa học là?", a:["CaO","Ca(OH)₂","CaCO₃","CaCl₂"]},
  {q:"Muối ăn bổ sung iot giúp phòng bệnh gì?", a:["Bướu cổ","Còi xương","Quáng gà","Thiếu máu"]},
  {q:"Vì sao đồ nhôm khó bị gỉ?", a:["Có lớp oxit nhôm mỏng bảo vệ","Nhôm không phản ứng với oxi","Nhôm rất cứng","Nhôm nặng"]},
  {q:"Hợp chất của natri khi đốt làm ngọn lửa có màu gì?", a:["Vàng","Xanh lục","Đỏ tím","Trắng"]},
  {q:"Tinh bột gặp dung dịch iot cho màu gì?", a:["Xanh tím","Đỏ","Vàng","Không màu"]},
  {q:"Trộn giấm với baking soda sinh ra khí nào?", a:["CO₂","O₂","H₂","N₂"]},
  {q:"Phản ứng của chất béo với dung dịch kiềm để tạo xà phòng gọi là?", a:["Xà phòng hóa","Este hóa","Trùng hợp","Lên men"]},
  {q:"Nước oxi già dùng để sát khuẩn có công thức hóa học là?", a:["H₂O₂","H₂O","HClO","O₃"]},
  {q:"Hạt mang điện âm trong nguyên tử là?", a:["Electron","Proton","Nơtron","Hạt nhân"]},
  {q:"Số hiệu nguyên tử cho biết số lượng hạt nào trong nguyên tử?", a:["Proton","Nơtron","Phân tử","Liên kết"]},
  {q:"Các đồng vị của cùng một nguyên tố khác nhau ở điểm nào?", a:["Số nơtron","Số proton","Số electron","Số hiệu nguyên tử"]}
];

const NATURE2 = [
  {q:"Đơn vị đo điện trở là gì?", a:["Ôm","Ampe","Vôn","Oát"]},
  {q:"Đơn vị đo cường độ dòng điện là gì?", a:["Ampe","Ôm","Vôn","Jun"]},
  {q:"Đơn vị đo hiệu điện thế là gì?", a:["Vôn","Ampe","Ôm","Niutơn"]},
  {q:"Đơn vị đo công suất là gì?", a:["Oát","Jun","Niutơn","Pascal"]},
  {q:"Sự chuyển trực tiếp từ thể rắn sang thể khí gọi là?", a:["Thăng hoa","Ngưng tụ","Đông đặc","Nóng chảy"]},
  {q:"Tầng khí quyển nào chứa lớp ozon?", a:["Tầng bình lưu","Tầng đối lưu","Tầng trung gian","Tầng ngoài"]},
  {q:"Hiện tượng thời tiết (mây, mưa) chủ yếu xảy ra ở tầng nào?", a:["Tầng đối lưu","Tầng bình lưu","Tầng nhiệt","Tầng ngoài"]},
  {q:"Lớp nằm giữa vỏ và nhân Trái Đất gọi là gì?", a:["Lớp manti","Thạch quyển","Khí quyển","Thủy quyển"]},
  {q:"Đường vĩ tuyến 0° được gọi là gì?", a:["Xích đạo","Chí tuyến Bắc","Chí tuyến Nam","Kinh tuyến gốc"]},
  {q:"Châu lục có diện tích lớn nhất là?", a:["Châu Á","Châu Phi","Châu Mỹ","Châu Âu"]},
  {q:"Châu lục có diện tích nhỏ nhất là?", a:["Châu Đại Dương","Châu Âu","Nam Cực","Châu Phi"]},
  {q:"“Vành đai lửa” tập trung nhiều núi lửa và động đất bao quanh đại dương nào?", a:["Thái Bình Dương","Đại Tây Dương","Ấn Độ Dương","Bắc Băng Dương"]},
  {q:"Độ mạnh của động đất thường được đo bằng thang nào?", a:["Thang Richter","Thang Celsius","Thang pH","Thang Beaufort"]},
  {q:"Chu kỳ các pha của Mặt Trăng khoảng bao nhiêu ngày?", a:["29,5 ngày","7 ngày","365 ngày","14 ngày"]},
  {q:"Hành tinh nào nổi tiếng với hệ thống vành đai rõ nét?", a:["Sao Thổ","Sao Hỏa","Sao Kim","Sao Thủy"]},
  {q:"Hệ Mặt Trời nằm trong thiên hà nào?", a:["Dải Ngân Hà","Tiên Nữ","Tam Giác","Thiên hà Xoáy"]},
  {q:"Ánh sáng từ Mặt Trời đến Trái Đất mất khoảng bao lâu?", a:["Khoảng 8 phút","Khoảng 1 giây","Khoảng 1 giờ","Khoảng 1 ngày"]},
  {q:"Bào quan nào được ví như “nhà máy năng lượng” của tế bào?", a:["Ty thể","Lục lạp","Ribôxôm","Nhân"]},
  {q:"Người có bao nhiêu nhiễm sắc thể trong tế bào sinh dưỡng?", a:["46","23","48","44"]},
  {q:"Tim người có mấy ngăn?", a:["4","2","3","5"]},
  {q:"Cơ quan nào chủ yếu lọc máu và tạo nước tiểu?", a:["Thận","Gan","Phổi","Tụy"]},
  {q:"Người trưởng thành có bao nhiêu chiếc răng (đủ bộ)?", a:["32","28","36","30"]},
  {q:"Nhịp tim lúc nghỉ ngơi của người trưởng thành khỏe mạnh thường khoảng bao nhiêu lần/phút?", a:["60–100","20–40","120–160","200–240"]},
  {q:"Côn trùng có mấy chân?", a:["6","8","4","10"]},
  {q:"Nhện có mấy chân?", a:["8","6","4","10"]},
  {q:"Mực và bạch tuộc thuộc ngành động vật nào?", a:["Thân mềm","Chân khớp","Giun đốt","Cá"]},
  {q:"Tằm ăn lá cây nào để nhả tơ?", a:["Dâu","Chè","Sắn","Cà phê"]},
  {q:"Ong mật làm ra mật từ nguyên liệu nào?", a:["Mật hoa","Nhựa cây","Nước đường mía","Trái chín"]},
  {q:"Cá voi thở bằng cơ quan nào?", a:["Phổi","Mang","Da","Khí quản như côn trùng"]},
  {q:"Loài thú duy nhất có khả năng bay thực sự là?", a:["Dơi","Sóc bay","Chồn bay","Cá heo"]},
  {q:"Bạch cầu có chức năng chính nào?", a:["Bảo vệ cơ thể, tiêu diệt vi khuẩn","Vận chuyển oxi","Làm đông máu","Dự trữ năng lượng"]}
];

const FOLK2 = [
  {q:"“Mùng một lưỡi trai, mùng hai lá lúa” mô tả điều gì?", a:["Hình dạng Mặt Trăng những ngày đầu tháng âm lịch","Hình dạng cánh đồng lúa","Cách rèn lưỡi liềm","Các mùa trong năm"]},
  {q:"“Hễ nghe tiếng sấm giật mình mà lên” nói về lúa chiêm gặp sấm sẽ thế nào?", a:["Sinh trưởng mạnh hơn","Bị chết","Ngừng phát triển","Mọc ít lá"]},
  {q:"“Tháng Năm chưa nằm đã sáng, tháng Mười chưa cười đã tối” nói về điều gì?", a:["Ngày dài đêm ngắn mùa hè, ngày ngắn đêm dài mùa đông","Thời tiết đổi liên tục","Mùa gặt hái","Giờ đi ngủ của người nông dân"]},
  {q:"“Lạt mềm buộc chặt” khuyên điều gì?", a:["Mềm mỏng, khéo léo thì dễ thành công","Dùng sức mạnh để thắng","Buộc lạt phải thật chặt","Nên dùng dây mềm"]},
  {q:"“Biết thì thưa thốt, không biết thì dựa cột mà nghe” khuyên điều gì?", a:["Khiêm tốn, biết thì nói, không biết thì lắng nghe","Nên im lặng mọi lúc","Cứ nói là đúng","Phải dựa vào cột nhà"]},
  {q:"“Học thầy không tày học bạn” nhấn mạnh điều gì?", a:["Học hỏi từ bạn bè cũng rất bổ ích","Thầy dạy không tốt","Không cần đến trường","Bạn bè luôn giỏi hơn thầy"]},
  {q:"“Không thầy đố mày làm nên” nhấn mạnh điều gì?", a:["Vai trò quan trọng của người thầy","Không cần học thầy","Phải tự học mọi thứ","Thầy không cần thiết"]},
  {q:"“Thương người như thể thương thân” khuyên chúng ta điều gì?", a:["Yêu thương, giúp đỡ người khác như chính mình","Chỉ lo cho bản thân","Không nên giúp ai","Nhường mọi thứ cho người khác"]},
  {q:"“Ăn cháo đá bát” chỉ kiểu người nào?", a:["Vô ơn, phản bội người đã giúp mình","Người ăn nhiều","Người nấu cháo ngon","Người hay đập đồ"]},
  {q:"“Nói có sách, mách có chứng” nghĩa là gì?", a:["Nói điều gì cũng phải có bằng chứng","Nói nhiều thì hay","Mách lẻo giỏi","Nói phải có sách trong tay"]},
  {q:"“Trâu buộc ghét trâu ăn” chỉ tính cách nào?", a:["Ghen ghét, đố kỵ với người khá hơn","Thương yêu trâu bò","Chăm chỉ làm việc","Tiết kiệm"]},
  {q:"“Chín người mười ý” nói về điều gì?", a:["Mỗi người một ý kiến khác nhau","Mọi người đồng ý nhau","Thiếu một người","Phải bàn bạc nhiều lần"]},
  {q:"“Nước đổ đầu vịt” chỉ tình huống nào?", a:["Nói hoặc khuyên mà người nghe không để tâm","Vịt rất thích nước","Nước chảy rất mạnh","Việc dễ làm"]},
  {q:"“Đứng núi này trông núi nọ” chỉ thái độ nào?", a:["Không hài lòng với hiện tại, luôn mơ ước thứ khác","Thích leo núi","Biết đủ","Quan sát kỹ"]},
  {q:"“Mưa dầm thấm lâu” có nghĩa là gì?", a:["Tác động kiên trì, từ từ sẽ có kết quả sâu sắc","Mưa nhiều gây lụt","Mưa to thì chóng tạnh","Mưa làm ướt quần áo"]},
  {q:"“Bầu ơi thương lấy bí cùng, tuy rằng khác giống nhưng chung một giàn” nói về điều gì?", a:["Tình đoàn kết, thương yêu giữa những người cùng chung cộng đồng","Cách trồng bầu bí","Phân biệt giống cây","Giàn leo cho cây"]},
  {q:"“Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra” nói về điều gì?", a:["Công ơn to lớn của cha mẹ","Cảnh núi sông","Cách tìm nguồn nước","Nghĩa vụ của người con trai"]},
  {q:"“Tre già măng mọc” có nghĩa là gì?", a:["Thế hệ sau kế tiếp thế hệ trước","Tre già thì hỏng","Măng mọc nhanh","Trồng tre khó"]},
  {q:"“Gieo gió gặt bão” ý nói gì?", a:["Làm điều xấu sẽ chịu hậu quả nặng nề","Trồng cây theo mùa gió","Nên đón gió","Bão rất hiếm"]},
  {q:"“Kiến tha lâu cũng đầy tổ” khuyên điều gì?", a:["Tích góp, cố gắng từng chút sẽ có kết quả","Kiến rất khỏe","Nên làm tổ sớm","Việc nhỏ không quan trọng"]},
  {q:"“Ếch ngồi đáy giếng” chỉ kiểu người nào?", a:["Hiểu biết hạn hẹp mà tưởng mình giỏi","Người thích bơi lội","Người sống kín đáo","Người khiêm tốn"]},
  {q:"“Trời nắng tốt dưa, trời mưa tốt lúa” nói về điều gì?", a:["Mỗi loại cây có điều kiện thời tiết thích hợp riêng","Dưa và lúa trồng cùng mùa","Nắng và mưa luôn xen kẽ","Thời tiết không quan trọng"]},
  {q:"“Cây cao bóng cả” thường ý nói gì?", a:["Người có uy tín, tài năng che chở được cho nhiều người","Cây to thì nhiều bóng","Nên trồng cây cao","Cây cao dễ đổ"]},
  {q:"“Có chí thì nên” khuyên điều gì?", a:["Có ý chí quyết tâm thì sẽ thành công","Chí là tên một người","Cần nhiều tiền","Nên chờ cơ hội"]}
];

// ---------- Sinh tự động ----------
function pickOthers(list,item,idx,n=3){return shuffle(list.filter(x=>x!==item)).slice(0,n).map(x=>x[idx]);}

// Hợp chất: [công thức, tên]
const COMPOUNDS = [
  ["H₂O","Nước"],["CO₂","Cacbon đioxit"],["NaCl","Natri clorua"],["HCl","Axit clohiđric"],
  ["H₂SO₄","Axit sunfuric"],["HNO₃","Axit nitric"],["NaOH","Natri hiđroxit"],["KOH","Kali hiđroxit"],
  ["Ca(OH)₂","Canxi hiđroxit"],["CaCO₃","Canxi cacbonat"],["CaO","Canxi oxit"],["NH₃","Amoniac"],
  ["CH₄","Metan"],["C₂H₅OH","Etanol"],["C₆H₁₂O₆","Glucôzơ"],["O₃","Ozon"],
  ["H₂O₂","Hiđro peroxit"],["SO₂","Lưu huỳnh đioxit"],["CO","Cacbon monoxit"],["NaHCO₃","Natri hiđrocacbonat"],
  ["Fe₂O₃","Sắt(III) oxit"],["CuSO₄","Đồng(II) sunfat"],["KMnO₄","Kali pemanganat"],["NaClO","Natri hipoclorit"],
  ["N₂O","Đinitơ oxit"],["SiO₂","Silic đioxit"],["Al₂O₃","Nhôm oxit"],["MgO","Magie oxit"],
  ["AgNO₃","Bạc nitrat"],["KNO₃","Kali nitrat"]
];
function genCompounds(){
  const out=[];
  for(const c of COMPOUNDS){
    out.push({q:`Công thức hóa học của ${c[1].toLowerCase()} là?`, a:[c[0],...pickOthers(COMPOUNDS,c,0)]});
    out.push({q:`Hợp chất có công thức ${c[0]} có tên là gì?`, a:[c[1],...pickOthers(COMPOUNDS,c,1)]});
  }
  return out;
}

// Thủ đô: [quốc gia, thủ đô]
const CAPITALS = [
  ["Việt Nam","Hà Nội"],["Thái Lan","Bangkok"],["Lào","Viêng Chăn"],["Campuchia","Phnom Penh"],
  ["Myanmar","Naypyidaw"],["Malaysia","Kuala Lumpur"],["Philippines","Manila"],["Nhật Bản","Tokyo"],
  ["Hàn Quốc","Seoul"],["Trung Quốc","Bắc Kinh"],["Ấn Độ","New Delhi"],["Pakistan","Islamabad"],
  ["Nga","Moscow"],["Pháp","Paris"],["Đức","Berlin"],["Ý","Rome"],
  ["Tây Ban Nha","Madrid"],["Bồ Đào Nha","Lisbon"],["Anh","London"],["Hà Lan","Amsterdam"],
  ["Thụy Sĩ","Bern"],["Áo","Vienna"],["Hy Lạp","Athens"],["Thổ Nhĩ Kỳ","Ankara"],
  ["Ai Cập","Cairo"],["Kenya","Nairobi"],["Ma-rốc","Rabat"],["Canada","Ottawa"],
  ["Mỹ","Washington D.C."],["Mexico","Mexico City"],["Brazil","Brasília"],["Argentina","Buenos Aires"],
  ["Chile","Santiago"],["Peru","Lima"],["Colombia","Bogotá"],["New Zealand","Wellington"],
  ["Thụy Điển","Stockholm"],["Na Uy","Oslo"],["Phần Lan","Helsinki"],["Đan Mạch","Copenhagen"],
  ["Ba Lan","Warsaw"],["Ukraine","Kyiv"],["Ả Rập Xê Út","Riyadh"],["Iran","Tehran"],
  ["Nepal","Kathmandu"],["Bangladesh","Dhaka"],["Mông Cổ","Ulaanbaatar"],["Cuba","Havana"],
  ["Ireland","Dublin"],["Bỉ","Brussels"],["Cộng hòa Séc","Prague"],["Hungary","Budapest"],
  ["Nigeria","Abuja"],["Ethiopia","Addis Ababa"]
];
function genCapitals(){
  const out=[];
  for(const c of CAPITALS){
    out.push({q:`Thủ đô của ${c[0]} là thành phố nào?`, a:[c[1],...pickOthers(CAPITALS,c,1)]});
    out.push({q:`${c[1]} là thủ đô của quốc gia nào?`, a:[c[0],...pickOthers(CAPITALS,c,0)]});
  }
  return out;
}

// Phân loại động vật: [tên, nhóm]
const CLASSES = ["Thú","Chim","Bò sát","Lưỡng cư","Cá","Côn trùng"];
const ANIMALS = [
  ["Dơi","Thú"],["Cá heo","Thú"],["Cá voi","Thú"],["Hổ","Thú"],["Voi","Thú"],["Chuột túi","Thú"],["Khỉ","Thú"],["Thỏ","Thú"],["Ngựa","Thú"],
  ["Đại bàng","Chim"],["Cú mèo","Chim"],["Chim cánh cụt","Chim"],["Đà điểu","Chim"],["Vẹt","Chim"],["Gà","Chim"],
  ["Cá sấu","Bò sát"],["Rắn hổ mang","Bò sát"],["Rùa","Bò sát"],["Thằn lằn","Bò sát"],["Tắc kè","Bò sát"],
  ["Ếch","Lưỡng cư"],["Cóc","Lưỡng cư"],["Sa giông","Lưỡng cư"],
  ["Cá mập","Cá"],["Cá ngựa","Cá"],["Cá chép","Cá"],["Cá hồi","Cá"],["Cá đuối","Cá"],
  ["Ong","Côn trùng"],["Kiến","Côn trùng"],["Bướm","Côn trùng"],["Châu chấu","Côn trùng"],["Muỗi","Côn trùng"],["Chuồn chuồn","Côn trùng"]
];
function genAnimals(){
  return ANIMALS.map(an=>({
    q:`${an[0]} thuộc nhóm động vật nào?`,
    a:[an[1],...shuffle(CLASSES.filter(c=>c!==an[1])).slice(0,3)]
  }));
}

// Bộ phận ăn được: [cây, bộ phận]
const PARTS = ["Rễ","Thân","Lá","Hoa","Quả"];
const EDIBLE = [
  ["cà rốt","Rễ"],["củ cải trắng","Rễ"],["khoai lang","Rễ"],["khoai tây","Thân"],
  ["bắp cải","Lá"],["rau diếp","Lá"],["súp lơ","Hoa"],["cà chua","Quả"],
  ["dưa leo","Quả"],["ớt","Quả"],["đậu bắp","Quả"],["bí đỏ","Quả"],["cà tím","Quả"],["mía (phần lấy nước ngọt)","Thân"]
];
function genEdible(){
  return EDIBLE.map(e=>({
    q:`Phần ăn chủ yếu của ${e[0]} là bộ phận nào của cây?`,
    a:[e[1],...shuffle(PARTS.filter(p=>p!==e[1])).slice(0,3)]
  }));
}

const GENERATED = [...genCompounds(), ...genCapitals(), ...genAnimals(), ...genEdible()];
const EXTRA2 = [...BOTANY2, ...CHEM2, ...NATURE2, ...FOLK2, ...GENERATED];


const PHYSICS_SPACE = [
  {q:"Ai phát biểu định luật vạn vật hấp dẫn?", a:["Isaac Newton","Albert Einstein","Galileo Galilei","Nikola Tesla"]},
  {q:"Thuyết tương đối nổi tiếng gắn với nhà khoa học nào?", a:["Albert Einstein","Isaac Newton","Stephen Hawking","Max Planck"]},
  {q:"Đơn vị đo năng lượng và công trong hệ SI là gì?", a:["Jun","Oát","Niutơn","Pascal"]},
  {q:"Đơn vị đo tần số là gì?", a:["Héc (Hz)","Oát","Vôn","Ampe"]},
  {q:"Nhiệt độ không tuyệt đối (0 K) tương ứng khoảng bao nhiêu độ C?", a:["−273,15°C","0°C","−100°C","−459°C"]},
  {q:"Cầu vồng hình thành chủ yếu do hiện tượng nào?", a:["Khúc xạ và tán sắc ánh sáng","Nhiễu xạ sóng âm","Phản xạ toàn phần của mây","Từ trường Trái Đất"]},
  {q:"Bầu trời có màu xanh chủ yếu do hiện tượng nào?", a:["Tán xạ ánh sáng xanh bởi khí quyển","Phản chiếu của đại dương","Hơi nước màu xanh","Tầng ozon màu xanh"]},
  {q:"Sóng thần thường do nguyên nhân nào gây ra?", a:["Động đất dưới đáy biển","Gió mùa","Thủy triều lớn","Bão nhiệt đới nhỏ"]},
  {q:"Lực đẩy giúp vật nổi trong nước được gọi là lực gì?", a:["Lực đẩy Archimedes","Lực ma sát","Lực hướng tâm","Lực đàn hồi"]},
  {q:"Ảnh của vật tạo bởi gương phẳng là ảnh gì?", a:["Ảnh ảo, bằng vật","Ảnh thật, nhỏ hơn vật","Ảnh thật, lớn hơn vật","Không có ảnh"]},
  {q:"Một nam châm có mấy cực?", a:["2","1","3","4"]},
  {q:"Các ngôi sao như Mặt Trời chủ yếu cấu tạo từ những nguyên tố nào?", a:["Hiđro và heli","Oxi và nitơ","Cacbon và silic","Sắt và niken"]},
  {q:"Lỗ đen là vùng không gian có đặc điểm nào?", a:["Trọng lực mạnh đến mức ánh sáng cũng không thoát ra được","Không có vật chất","Là một ngôi sao rất sáng","Là một hành tinh đen"]},
  {q:"Hành tinh nào nóng nhất Hệ Mặt Trời do hiệu ứng nhà kính mạnh?", a:["Sao Kim","Sao Thủy","Sao Hỏa","Sao Mộc"]},
  {q:"Trái Đất có bao nhiêu vệ tinh tự nhiên?", a:["1","2","0","4"]},
  {q:"Ai là người đầu tiên đặt chân lên Mặt Trăng?", a:["Neil Armstrong","Yuri Gagarin","Buzz Aldrin","John Glenn"]},
  {q:"Ai là người đầu tiên bay vào vũ trụ?", a:["Yuri Gagarin","Neil Armstrong","Alan Shepard","Valentina Tereshkova"]},
  {q:"Trên hành tinh nào một ngày (tự quay) dài hơn một năm (quay quanh Mặt Trời)?", a:["Sao Kim","Sao Hỏa","Sao Mộc","Sao Thổ"]},
  {q:"Sao Diêm Vương hiện được phân loại là gì?", a:["Hành tinh lùn","Hành tinh khí","Vệ tinh","Sao chổi"]},
  {q:"Ánh sáng trắng của Mặt Trời thực chất gồm những gì?", a:["Nhiều ánh sáng màu hợp lại","Chỉ một màu trắng","Chỉ tia cực tím","Chỉ ánh sáng vàng"]},
  {q:"Âm thanh có cao độ càng cao khi tần số như thế nào?", a:["Càng lớn","Càng nhỏ","Không đổi","Bằng không"]},
  {q:"Vật chuyển động thẳng đều khi không có lực tác dụng — đó là nội dung của định luật nào?", a:["Định luật 1 Newton","Định luật 2 Newton","Định luật 3 Newton","Định luật Ôm"]}
];

const WORLD_HISTORY = [
  {q:"Cách mạng Pháp bùng nổ vào năm nào?", a:["1789","1776","1815","1848"]},
  {q:"Chiến tranh thế giới thứ nhất bắt đầu vào năm nào?", a:["1914","1905","1918","1939"]},
  {q:"Chiến tranh thế giới thứ hai kết thúc vào năm nào?", a:["1945","1939","1950","1918"]},
  {q:"Christopher Columbus đặt chân tới châu Mỹ năm nào?", a:["1492","1453","1519","1607"]},
  {q:"Bức tường Berlin sụp đổ vào năm nào?", a:["1989","1961","1975","1991"]},
  {q:"Vạn Lý Trường Thành thuộc quốc gia nào?", a:["Trung Quốc","Nhật Bản","Mông Cổ","Ấn Độ"]},
  {q:"Chữ viết của người Ai Cập cổ đại gọi là gì?", a:["Chữ tượng hình","Chữ hình nêm","Chữ La-tinh","Chữ Phạn"]},
  {q:"Cách mạng công nghiệp bắt đầu đầu tiên ở quốc gia nào?", a:["Anh","Pháp","Đức","Mỹ"]},
  {q:"Ai cải tiến máy hơi nước, góp phần mở đầu cách mạng công nghiệp?", a:["James Watt","Thomas Edison","Isaac Newton","Nikola Tesla"]},
  {q:"Ai được ghi nhận là người phát minh ra điện thoại?", a:["Alexander Graham Bell","Thomas Edison","Nikola Tesla","Guglielmo Marconi"]},
  {q:"Ai nổi tiếng với việc hoàn thiện và thương mại hóa bóng đèn sợi đốt?", a:["Thomas Edison","Alexander Bell","Albert Einstein","Michael Faraday"]},
  {q:"Anh em nhà Wright bay chuyến bay có động cơ đầu tiên vào năm nào?", a:["1903","1885","1927","1945"]},
  {q:"Ai phát hiện ra penicillin?", a:["Alexander Fleming","Louis Pasteur","Robert Koch","Edward Jenner"]},
  {q:"Ai là người phát triển vắc xin đậu mùa đầu tiên?", a:["Edward Jenner","Louis Pasteur","Alexander Fleming","Marie Curie"]},
  {q:"Ai là người phát minh ra máy in chữ rời ở châu Âu?", a:["Johannes Gutenberg","Leonardo da Vinci","Galileo","Martin Luther"]},
  {q:"Tháp Eiffel được hoàn thành vào năm nào?", a:["1889","1789","1920","1850"]},
  {q:"Thủ đô của Đế chế La Mã là thành phố nào?", a:["Rome","Athens","Constantinople","Carthage"]},
  {q:"Alexander Đại đế là vua của vương quốc nào?", a:["Macedonia","Ba Tư","Ai Cập","La Mã"]},
  {q:"Nước nào đưa người đầu tiên lên Mặt Trăng vào năm 1969?", a:["Mỹ","Liên Xô","Trung Quốc","Anh"]},
  {q:"Marie Curie nổi tiếng với việc nghiên cứu hiện tượng nào?", a:["Phóng xạ","Điện từ","Hấp dẫn","Quang điện"]}
];

const VIETNAM_CULTURE = [
  {q:"Khởi nghĩa Hai Bà Trưng nổ ra vào năm nào?", a:["Năm 40","Năm 938","Năm 1010","Năm 248"]},
  {q:"Ngô Quyền đại thắng quân Nam Hán trên sông Bạch Đằng vào năm nào?", a:["938","981","1077","1288"]},
  {q:"Trần Hưng Đạo lãnh đạo nhân dân ta chống quân xâm lược nào?", a:["Quân Mông – Nguyên","Quân Tống","Quân Minh","Quân Thanh"]},
  {q:"Khởi nghĩa Lam Sơn do ai lãnh đạo chống quân Minh?", a:["Lê Lợi","Quang Trung","Lý Thường Kiệt","Phùng Hưng"]},
  {q:"“Bình Ngô đại cáo” là tác phẩm của ai?", a:["Nguyễn Trãi","Nguyễn Du","Lê Thánh Tông","Trần Hưng Đạo"]},
  {q:"Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập ngày 2/9/1945 tại đâu?", a:["Quảng trường Ba Đình","Nhà hát Lớn Hà Nội","Hồ Hoàn Kiếm","Dinh Độc Lập"]},
  {q:"Phố cổ Hội An được UNESCO công nhận là Di sản thế giới vào năm nào?", a:["1999","1993","2003","2010"]},
  {q:"Quần thể di tích Cố đô Huế được UNESCO công nhận năm nào?", a:["1993","1999","2003","1985"]},
  {q:"Dân ca Quan họ gắn với tỉnh nào?", a:["Bắc Ninh","Nghệ An","Quảng Nam","Bến Tre"]},
  {q:"Hát Xoan là loại hình dân ca gắn với tỉnh nào?", a:["Phú Thọ","Thanh Hóa","Huế","Nam Định"]},
  {q:"Không gian văn hóa Cồng chiêng gắn với khu vực nào?", a:["Tây Nguyên","Đồng bằng sông Cửu Long","Tây Bắc","Duyên hải miền Trung"]},
  {q:"Tết Trung thu được tổ chức vào ngày nào âm lịch?", a:["15/8","15/1","5/5","1/1"]},
  {q:"Tết Đoan Ngọ (giết sâu bọ) vào ngày nào âm lịch?", a:["5/5","15/8","10/3","23/12"]},
  {q:"Nguyên liệu chính của bánh chưng truyền thống là gì?", a:["Gạo nếp, đậu xanh, thịt lợn, lá dong","Bột mì, trứng, sữa","Gạo tẻ, thịt gà","Bột năng, tôm khô"]},
  {q:"Vùng nào nổi tiếng nhất về trồng cà phê ở Việt Nam?", a:["Tây Nguyên","Đồng bằng sông Hồng","Tây Bắc","Duyên hải Nam Trung Bộ"]},
  {q:"Con sông dài nhất chảy trọn trong lãnh thổ Việt Nam là sông nào?", a:["Sông Đồng Nai","Sông Hồng","Sông Mã","Sông Cả"]},
  {q:"Hồ nước ngọt tự nhiên lớn nhất Việt Nam là hồ nào?", a:["Hồ Ba Bể","Hồ Tây","Hồ Dầu Tiếng","Hồ Thác Bà"]},
  {q:"Thành phố đông dân nhất Việt Nam là?", a:["TP. Hồ Chí Minh","Hà Nội","Đà Nẵng","Hải Phòng"]},
  {q:"Đèo Hải Vân nằm giữa hai địa phương nào?", a:["Huế và Đà Nẵng","Quảng Nam và Quảng Ngãi","Nha Trang và Phan Rang","Hà Tĩnh và Quảng Bình"]},
  {q:"Cực Bắc trên đất liền của Việt Nam ở địa danh nào?", a:["Lũng Cú (Hà Giang)","Móng Cái (Quảng Ninh)","Sa Pa (Lào Cai)","Trùng Khánh (Cao Bằng)"]},
  {q:"Cực Nam trên đất liền của Việt Nam ở địa danh nào?", a:["Đất Mũi (Cà Mau)","Rạch Giá","Hà Tiên","Bạc Liêu"]},
  {q:"Quốc ca Việt Nam “Tiến quân ca” do ai sáng tác?", a:["Văn Cao","Phạm Tuyên","Nguyễn Văn Thương","Hoàng Vân"]},
  {q:"Loài hoa nào được xem là quốc hoa của Việt Nam?", a:["Hoa sen","Hoa mai","Hoa đào","Hoa hồng"]}
];

const LITERATURE_ART = [
  {q:"Bức tranh “Mona Lisa” do ai vẽ?", a:["Leonardo da Vinci","Michelangelo","Raphael","Pablo Picasso"]},
  {q:"Bức tranh “Đêm đầy sao” là của họa sĩ nào?", a:["Vincent van Gogh","Claude Monet","Salvador Dalí","Rembrandt"]},
  {q:"Vở kịch “Hamlet” do ai sáng tác?", a:["William Shakespeare","Molière","Victor Hugo","Charles Dickens"]},
  {q:"Nhà soạn nhạc Beethoven là người nước nào?", a:["Đức","Áo","Ý","Pháp"]},
  {q:"“Những người khốn khổ” là tiểu thuyết của nhà văn nào?", a:["Victor Hugo","Leo Tolstoy","Honoré de Balzac","Alexandre Dumas"]},
  {q:"“Hoàng tử bé” là tác phẩm của ai?", a:["Antoine de Saint-Exupéry","Jules Verne","Hans Christian Andersen","Roald Dahl"]},
  {q:"Tác giả bộ truyện Harry Potter là ai?", a:["J. K. Rowling","Suzanne Collins","C. S. Lewis","Stephenie Meyer"]},
  {q:"Một cây đàn piano tiêu chuẩn có bao nhiêu phím?", a:["88","76","61","100"]},
  {q:"Nhà văn Hans Christian Andersen, tác giả “Nàng tiên cá”, là người nước nào?", a:["Đan Mạch","Thụy Điển","Na Uy","Đức"]},
  {q:"“Dế Mèn phiêu lưu ký” là tác phẩm của nhà văn nào?", a:["Tô Hoài","Nam Cao","Ngô Tất Tố","Nguyên Hồng"]},
  {q:"“Tắt đèn” là tiểu thuyết của nhà văn nào?", a:["Ngô Tất Tố","Vũ Trọng Phụng","Nam Cao","Nguyễn Công Hoan"]},
  {q:"“Số đỏ” là tác phẩm của nhà văn nào?", a:["Vũ Trọng Phụng","Nam Cao","Tô Hoài","Kim Lân"]},
  {q:"Truyện ngắn “Chí Phèo” của nhà văn nào?", a:["Nam Cao","Ngô Tất Tố","Kim Lân","Thạch Lam"]},
  {q:"“Vợ nhặt” là truyện ngắn của nhà văn nào?", a:["Kim Lân","Nam Cao","Tô Hoài","Nguyễn Tuân"]},
  {q:"Bài thơ “Tây Tiến” của nhà thơ nào?", a:["Quang Dũng","Huy Cận","Tố Hữu","Xuân Diệu"]},
  {q:"Bài thơ “Đoàn thuyền đánh cá” của nhà thơ nào?", a:["Huy Cận","Quang Dũng","Chế Lan Viên","Nguyễn Bính"]},
  {q:"Nhà soạn nhạc Mozart sinh ra ở quốc gia nào?", a:["Áo","Đức","Ý","Hungary"]}
];

const TECH_MATH_SPORT = [
  {q:"CPU là viết tắt của cụm từ nào?", a:["Central Processing Unit","Computer Personal Unit","Central Program Utility","Control Processing Usage"]},
  {q:"1 byte bằng bao nhiêu bit?", a:["8","4","16","10"]},
  {q:"Ai là người sáng tạo ra World Wide Web?", a:["Tim Berners-Lee","Bill Gates","Steve Jobs","Mark Zuckerberg"]},
  {q:"HTML được dùng để làm gì?", a:["Tạo cấu trúc trang web","Quản lý cơ sở dữ liệu","Dịch ngôn ngữ máy","Chỉnh sửa ảnh"]},
  {q:"Python là gì?", a:["Một ngôn ngữ lập trình","Một hệ điều hành","Một trình duyệt web","Một loại phần cứng"]},
  {q:"AI là viết tắt của cụm từ nào?", a:["Artificial Intelligence","Automatic Internet","Advanced Input","Applied Interface"]},
  {q:"Hệ điều hành di động Android do công ty nào phát triển chính?", a:["Google","Apple","Microsoft","Nokia"]},
  {q:"Mã nhị phân chỉ dùng những chữ số nào?", a:["0 và 1","0 đến 9","1 và 2","0 và 2"]},
  {q:"USB là viết tắt của cụm từ nào?", a:["Universal Serial Bus","United System Board","Unique Storage Block","Universal Signal Base"]},
  {q:"Một đội bóng đá có bao nhiêu cầu thủ trên sân (kể cả thủ môn)?", a:["11","10","9","12"]},
  {q:"Thế vận hội Olympic được tổ chức chu kỳ bao nhiêu năm một lần?", a:["4 năm","2 năm","3 năm","5 năm"]},
  {q:"Cự ly một cuộc chạy marathon chính thức là bao nhiêu?", a:["42,195 km","21,097 km","10 km","50 km"]},
  {q:"Bàn cờ vua có bao nhiêu ô?", a:["64","32","81","100"]},
  {q:"World Cup bóng đá đầu tiên được tổ chức năm nào?", a:["1930","1950","1920","1966"]},
  {q:"Pelé, huyền thoại bóng đá, là người nước nào?", a:["Brazil","Argentina","Bồ Đào Nha","Ý"]},
  {q:"Giải quần vợt Grand Slam nào được tổ chức trên sân cỏ?", a:["Wimbledon","Roland Garros","US Open","Úc Mở rộng"]},
  {q:"Tổng ba góc trong của một tam giác bằng bao nhiêu?", a:["180°","360°","90°","270°"]},
  {q:"Số nguyên tố nhỏ nhất là số nào?", a:["2","1","3","0"]},
  {q:"Công thức tính diện tích hình tròn bán kính r là?", a:["πr²","2πr","πd","r²/2"]},
  {q:"Định lý Pythagore áp dụng cho loại tam giác nào?", a:["Tam giác vuông","Tam giác đều","Tam giác cân bất kỳ","Mọi tam giác"]},
  {q:"Dãy Fibonacci bắt đầu 1, 1, 2, 3, 5 thì số tiếp theo là?", a:["8","7","6","9"]},
  {q:"Hình lục giác có bao nhiêu cạnh?", a:["6","5","7","8"]},
  {q:"Giá trị gần đúng của số π là?", a:["3,14","2,71","1,62","4,13"]}
];

const GEOGRAPHY_WORLD = [
  {q:"Con sông có lưu lượng nước lớn nhất thế giới là?", a:["Sông Amazon","Sông Nile","Sông Mê Công","Sông Dương Tử"]},
  {q:"Thác nước cao nhất thế giới là thác nào?", a:["Thác Angel (Venezuela)","Thác Niagara","Thác Victoria","Thác Iguazu"]},
  {q:"Hồ sâu nhất thế giới là hồ nào?", a:["Hồ Baikal","Hồ Victoria","Hồ Superior","Hồ Titicaca"]},
  {q:"Quốc gia có diện tích nhỏ nhất thế giới là?", a:["Vatican","Monaco","San Marino","Liechtenstein"]},
  {q:"Khu rừng nhiệt đới lớn nhất thế giới nằm ở đâu?", a:["Amazon (Nam Mỹ)","Congo (châu Phi)","Borneo","Tây Bắc Thái Bình Dương"]},
  {q:"Eo biển nào ngăn cách châu Á và Bắc Mỹ?", a:["Eo biển Bering","Eo biển Gibraltar","Eo biển Malacca","Eo biển Hormuz"]},
  {q:"Kênh đào nào nối Địa Trung Hải với Biển Đỏ?", a:["Kênh đào Suez","Kênh đào Panama","Kênh đào Kiel","Kênh đào Corinth"]},
  {q:"Kênh đào Panama nối hai đại dương nào?", a:["Đại Tây Dương và Thái Bình Dương","Ấn Độ Dương và Thái Bình Dương","Đại Tây Dương và Ấn Độ Dương","Bắc Băng Dương và Thái Bình Dương"]},
  {q:"Lục địa nào lạnh nhất thế giới?", a:["Nam Cực","Bắc Mỹ","Châu Âu","Châu Á"]},
  {q:"Rãnh Mariana, nơi sâu nhất đại dương, nằm ở đại dương nào?", a:["Thái Bình Dương","Đại Tây Dương","Ấn Độ Dương","Nam Đại Dương"]},
  {q:"Dãy núi Andes nằm ở châu lục nào?", a:["Nam Mỹ","Châu Âu","Châu Phi","Châu Á"]},
  {q:"Dãy núi Alps nằm chủ yếu ở châu lục nào?", a:["Châu Âu","Châu Á","Châu Phi","Bắc Mỹ"]},
  {q:"Núi Phú Sĩ (Fuji) là biểu tượng của quốc gia nào?", a:["Nhật Bản","Hàn Quốc","Trung Quốc","Nepal"]},
  {q:"Biển Chết nổi tiếng vì đặc điểm nào?", a:["Độ mặn rất cao, người dễ nổi","Nước rất lạnh","Không có sóng","Có nhiều cá mập"]},
  {q:"Núi cao nhất thế giới so với mực nước biển là?", a:["Everest","K2","Kilimanjaro","Mont Blanc"]},
  {q:"Sa mạc Sahara nằm ở châu lục nào?", a:["Châu Phi","Châu Á","Châu Úc","Nam Mỹ"]}
];

// ---------- Sinh tự động ----------
function distractors(values, answer, n=3){
  return shuffle([...new Set(values)].filter(v=>v!==answer)).slice(0,n);
}

// Quốc gia → châu lục
const CONTINENTS = ["Châu Á","Châu Âu","Châu Phi","Bắc Mỹ","Nam Mỹ","Châu Đại Dương"];
const COUNTRY_CONT = [
  ["Việt Nam","Châu Á"],["Nhật Bản","Châu Á"],["Ấn Độ","Châu Á"],["Thái Lan","Châu Á"],["Hàn Quốc","Châu Á"],
  ["Mông Cổ","Châu Á"],["Nepal","Châu Á"],["Iran","Châu Á"],["Ả Rập Xê Út","Châu Á"],
  ["Pháp","Châu Âu"],["Đức","Châu Âu"],["Ý","Châu Âu"],["Ba Lan","Châu Âu"],["Na Uy","Châu Âu"],
  ["Hy Lạp","Châu Âu"],["Tây Ban Nha","Châu Âu"],["Thụy Sĩ","Châu Âu"],["Ukraine","Châu Âu"],
  ["Ai Cập","Châu Phi"],["Kenya","Châu Phi"],["Nigeria","Châu Phi"],["Ma-rốc","Châu Phi"],["Ethiopia","Châu Phi"],["Madagascar","Châu Phi"],["Ghana","Châu Phi"],
  ["Canada","Bắc Mỹ"],["Mexico","Bắc Mỹ"],["Cuba","Bắc Mỹ"],["Mỹ","Bắc Mỹ"],
  ["Brazil","Nam Mỹ"],["Argentina","Nam Mỹ"],["Peru","Nam Mỹ"],["Chile","Nam Mỹ"],["Colombia","Nam Mỹ"],["Venezuela","Nam Mỹ"],["Bolivia","Nam Mỹ"],
  ["Úc","Châu Đại Dương"],["New Zealand","Châu Đại Dương"],["Fiji","Châu Đại Dương"]
];
function genContinents(){
  return COUNTRY_CONT.map(c=>({
    q:`${c[0]} nằm ở châu lục (hoặc khu vực) nào?`,
    a:[c[1],...distractors(CONTINENTS,c[1])]
  }));
}

// Quốc gia → tiền tệ
const CURRENCIES = [
  ["Nhật Bản","Yên Nhật"],["Hàn Quốc","Won"],["Trung Quốc","Nhân dân tệ"],["Thái Lan","Baht"],["Mỹ","Đô la Mỹ"],
  ["Anh","Bảng Anh"],["Nga","Rúp"],["Ấn Độ","Rupee"],["Thụy Sĩ","Franc Thụy Sĩ"],["Brazil","Real"],
  ["Mexico","Peso"],["Việt Nam","Đồng"],["Malaysia","Ringgit"],["Indonesia","Rupiah"],["Thổ Nhĩ Kỳ","Lira"],
  ["Úc","Đô la Úc"],["Canada","Đô la Canada"],["Ba Lan","Złoty"],["Thụy Điển","Krona"],["Ai Cập","Bảng Ai Cập"],
  ["Nam Phi","Rand"],["Israel","Shekel"],["Campuchia","Riel"],["Lào","Kíp"],["Myanmar","Kyat"],
  ["Pháp","Euro"],["Đức","Euro"],["Ý","Euro"],["Tây Ban Nha","Euro"],["Hà Lan","Euro"],["Philippines","Peso"]
];
function genCurrencies(){
  const vals=CURRENCIES.map(c=>c[1]);
  return CURRENCIES.map(c=>({
    q:`Đơn vị tiền tệ của ${c[0]} là gì?`,
    a:[c[1],...distractors(vals,c[1])]
  }));
}

// Toán cơ bản: căn bậc hai và bình phương
function genMath(){
  const out=[];
  for(let n=3;n<=20;n++){
    const sq=n*n;
    out.push({q:`Căn bậc hai (số dương) của ${sq} là bao nhiêu?`, a:[String(n),String(n+1),String(n-1),String(n+2)]});
    const cand=[sq+1,sq-1,sq+n,sq-n,sq+2*n,n*2+1].filter(v=>v!==sq);
    out.push({q:`${n}² bằng bao nhiêu?`, a:[String(sq),...[...new Set(cand)].slice(0,3).map(String)]});
  }
  return out;
}

const GENERATED3 = [...genContinents(), ...genCurrencies(), ...genMath()];

const BY_TOPIC = {
  physicsSpace: PHYSICS_SPACE,
  worldHistory: WORLD_HISTORY,
  vietnamCulture: VIETNAM_CULTURE,
  literatureArt: LITERATURE_ART,
  techMathSport: TECH_MATH_SPORT,
  geographyWorld: GEOGRAPHY_WORLD,
  generated: GENERATED3
};
const EXTRA3 = Object.values(BY_TOPIC).flat();


// =====================================================================
//  GỘP NGÂN HÀNG CÂU HỎI
// =====================================================================
VN.push(...VIETNAM_CULTURE);
WORLD.push(...EXTRA, ...EXTRA2, ...EXTRA3.filter(q => !VIETNAM_CULTURE.includes(q)));

// Loại câu trùng nội dung câu hỏi
function dedupe(list){const seen=new Set();return list.filter(x=>{if(seen.has(x.q))return false;seen.add(x.q);return true;});}
VN.splice(0, VN.length, ...dedupe(VN));
WORLD.splice(0, WORLD.length, ...dedupe(WORLD));

function prep(item,final){const o=shuffle(item.a.map((t,i)=>({t,c:i===0})));return{q:item.q,opts:o.map(x=>x.t),ci:o.findIndex(x=>x.c),final};}

// true  = 4 câu đầu bốc ngẫu nhiên từ TOÀN BỘ ngân hàng (VN + WORLD gộp chung)
// false = kiểu cũ: 3 câu Việt Nam + 1 câu thế giới
const MIX_ALL = true;
const ALL = dedupe([...VN, ...WORLD]);

// 4 câu đầu (xáo trộn) + câu 5 là câu cuối (khó hơn, x2 điểm)
function buildQuestions(){
  const first = MIX_ALL
    ? shuffle(ALL).slice(0,4).map(x=>prep(x,false))
    : shuffle([...shuffle(VN).slice(0,3).map(x=>prep(x,false)),...shuffle(WORLD).slice(0,1).map(x=>prep(x,false))]);
  return [...first,prep(shuffle(FINAL)[0],true)];
}
module.exports={buildQuestions};
