### Flow

#### Convert.ipynb

1. nhận data gốc của đề bài (raw data là file log)
2. chuyển đổi raw (drone.parquet) thành những chuyến bay (flight.parquet)

#### flight_stat.ipynb

3. feature selection chọn những điều kiện mà ảnh hưởng đến pin của drone
4. dùng correlation matrix để kiểm tra multicolinearity

#### train.ipynb

5. split data và đưa vào train với những tham số mặc định
6. predict và đánh giá kết quả
7. optimize tham số mô hình để tìm ra tham số tối ưu
8. retrain mô hình với tham số mới
9. kết quả mô hình trả về là năng lượng tiêu thụ

## detail for train.ipynb

## Bài toán tổng quát

Có một đội drone giao hàng. Mỗi con drone bay hết bao nhiêu năng lượng pin phụ thuộc vào:
tải trọng nó chở, gió hôm đó mạnh hay nhẹ, bay xa hay gần, bay nhanh hay chậm...

File này trả lời **3 câu hỏi liên tiếp**, câu sau dùng kết quả của câu trước:

1. **"Nếu drone chở X gram và đi đến route này, nó tốn bao nhiêu điện (Wh)?"** → dạy một mô hình AI đoán năng lượng mà drone tiêu thụ.
2. **"Với lượng pin còn lại của 1 drone, nó chở được TỐI ĐA bao nhiêu gram trên 1 route (không quay lại)?"** → dùng mô hình ở bước 1 để dò ngược ra con số này.
3. **"Có một đống đơn hàng cần giao, route nào, đơn nào xếp lên drone nào để không con nào bị quá tải, mà vẫn dùng ít drone nhất?"** → xếp đơn hàng vào từng drone.

Cả file là một dây chuyền 10 bước nối tiếp nhau để trả lời 3 câu hỏi đó. Bên dưới đi qua từng bước.

---

## Bước 0 — Chuẩn bị dữ liệu

Nạp bảng dữ liệu các chuyến bay đã có sẵn (`flight.parquet`). Mỗi dòng trong bảng này là
**một chuyến bay đã hoàn thành**, kèm theo tải trọng nó mang, gió lúc đó, tốc độ bay,
quãng đường bay, và quan trọng nhất: **năng lượng thực tế nó đã tiêu tốn** (`energy_consumed_Wh`).

---

## Bước 1 — Chọn ra "feature" để dự đoán năng lượng tiêu thụ

Có 13 features: quãng đường bay, độ cao, **tải trọng**, tốc độ gió, hướng gió,
tốc độ bay trung bình/tối đa, gia tốc...

Dữ liệu được chia làm 2 phần:

- **80% train**
- **20% test**

---

## Bước 2 — train nhiều models

Linear Regression, AdaBoost, Random Forest, XGBoost, LightGBM.
Train 5 models rồi so sánh kết quả

### càng chở nặng càng tốn điện

Khi train 2 mô hình XGBoost và LightGBM, file ép thêm 1 luật bắt buộc gọi là
**monotonic constraint** (ràng buộc đơn điệu): _tải trọng tăng lên thì năng lượng dự đoán
cũng phải tăng lên, không được giảm._

Nghe hiển nhiên trong đời thực (chở nặng hơn thì tốn xăng/điện hơn), nhưng nếu không ép luật này,
máy học đôi khi vẫn "học lệch" ra kết quả ngược đời do nhiễu trong dữ liệu — ví dụ đoán rằng
chở 3kg lại tốn ít điện hơn chở 2kg. Luật này giúp tránh lỗi đó, và **cực kỳ quan trọng**
cho bước 4 (dò tìm tải trọng tối đa) hoạt động đúng — sẽ giải thích ở dưới.

---

## Bước 3 — "Drone này chở tối đa bao nhiêu gram thì vẫn về được?"

Thuật toán dùng là **Binary Search** —

- Cần tìm là **tải trọng tối đa (gram)** mà drone còn bay về được với lượng pin hiện có.
- Thay vì hỏi người, file hỏi thẳng **mô hình AI đã train ở bước 2** — gọi mô hình này đóng vai trò
  "trọng tài" (oracle): _"Nếu tôi cho drone chở X gram trên route này, mày dự đoán tốn bao nhiêu Wh?"_
- Nếu Wh dự đoán **≤ lượng pin còn dùng được** → X gram là khả thi, thử tăng X lên xem còn chịu được không.
- Nếu Wh dự đoán **> lượng pin còn dùng được** → X gram là quá sức, thử giảm X xuống.
- Lặp lại việc "chia đôi khoảng còn lại" như vậy cho tới khi khoảng dò còn rất nhỏ (10 gram) —
  lúc đó coi như đã tìm ra tải trọng tối đa.

Đây chính là lý do bước 2 **bắt buộc** phải ép năng lượng tăng đơn điệu theo tải trọng:
binary search chỉ đúng khi "tăng tải trọng lên thì luôn tốn thêm điện, không bao giờ tốn ít đi" —
nếu đường cong gợn sóng lên xuống, thuật toán chia đôi khoảng sẽ dò sai đáp án.

**Lượng pin còn dùng được** không phải 100% pin còn lại, mà chỉ lấy 85% (`SAFETY_FACTOR`) —
giữ lại 15% pin dự phòng an toàn, tránh trường hợp bay hết đúng lúc rơi giữa đường.

---

## Bước 4 — Dựng "hồ sơ" cho từng route và "bảng pin" cho từng drone

Hai bảng dữ liệu giả lập được tạo ra (bản sao, không đụng vào dữ liệu gốc):

- **`route_profile`**: mỗi route (tuyến đường) có 1 hồ sơ trung bình — quãng đường bao xa,
  gió trung bình bao nhiêu, tốc độ bay bao nhiêu... (lấy trung bình từ các chuyến bay lịch sử
  từng đi qua route đó).
- **`drones_sim`**: bảng pin còn lại giả lập của 5 con drone (vì hiện chưa nối được dữ liệu pin
  thật-thời-gian-thực). Sau này khi có cảm biến pin thật, chỉ cần thay bảng này bằng dữ liệu
  thật, phần thuật toán phía trên **không cần sửa gì**.

---

## Bước 5 — Ghép mọi drone với mọi route: "Ma trận khả năng chở"

Với **mỗi cặp (drone, route)**, file lấy pin còn lại của drone đó + hồ sơ route đó, đưa vào
thuật toán binary search ở bước 3, ra được: _"Drone A trên route B chở tối đa được bao nhiêu gram."_

Làm vậy cho **toàn bộ tổ hợp** drone × route → ra một bảng lớn gọi là `feasibility_matrix`
(ma trận khả thi). Nếu ô nào cho ra 0 gram — nghĩa là ngay cả bay tay không, drone đó cũng
không đủ pin để hoàn thành route đó → route đó bị loại khỏi danh sách khả thi của drone này.

---

## Bước 6 — Bài toán chính: Xếp từng đơn hàng cụ thể vào từng drone

Đây là bước áp dụng thực tế nhất: có sẵn danh sách đơn hàng (đơn nào bao nhiêu kg, giao theo route nào),
và bảng `feasibility_matrix` cho biết mỗi drone chở tối đa bao nhiêu trên route đó — giờ cần
**xếp đơn hàng vào drone cụ thể**, sao cho:

- Không drone nào bị xếp vượt quá sức chở tối đa của nó.
- Tận dụng gần sát tối đa tải trọng cho phép (đỡ phí chuyến bay).
- Nếu 1 route có nhiều đơn hàng cộng lại vượt quá 1 drone, tự động dùng thêm drone thứ 2, thứ 3...

Thuật toán dùng: **Best-Fit Decreasing** (thuộc họ bài toán "Bin Packing" — xếp đồ vào thùng).
Hãy tưởng tượng bạn đang xếp hàng vào các thùng carton có sức chứa khác nhau, sao cho dùng ít
thùng nhất và mỗi thùng đầy gần sát miệng:

1. **Xếp các đơn hàng theo thứ tự từ NẶNG đến NHẸ trước.**
   (Xếp món nặng trước để tránh tình trạng cuối cùng còn dư 1 món to mà chẳng thùng nào đủ chỗ.)
2. **Xếp các drone khả dụng của route đó theo thứ tự từ khỏe pin nhất đến yếu pin nhất.**
   (Ưu tiên dùng drone chở khỏe nhất trước.)
3. Với mỗi đơn hàng, lần lượt:
   - Nhìn vào các drone **đã được mở ra dùng rồi** cho route này — chọn con nào
     **còn dư chỗ ÍT NHẤT nhưng vẫn đủ chứa đơn hàng này** (gọi là "best fit" — vừa khít nhất).
     → Việc này giúp mỗi drone được lấp gần sát trần tải trọng, không lãng phí chỗ trống.
   - Nếu không con nào trong các drone đã mở đủ chỗ chứa → **mở thêm 1 drone mới**
     (theo thứ tự khỏe pin nhất còn lại trong danh sách).
   - Nếu đã dùng hết toàn bộ drone khả dụng của route mà đơn hàng vẫn chưa có chỗ →
     đơn đó bị đánh dấu **"không xếp được"** (cần điều drone từ route khác, sạc thêm pin,
     hoặc chia nhỏ đơn hàng ra).

### Ví dụ nhỏ cho dễ hình dung

Giả sử route A có 2 drone khả dụng: Drone-1 chở tối đa 4kg, Drone-2 chở tối đa 3kg.
Có 4 đơn hàng: 3.5kg, 1kg, 2kg, 0.8kg.

- Sắp đơn hàng giảm dần: 3.5 → 2 → 1 → 0.8
- Sắp drone giảm dần theo sức chở: Drone-1 (4kg) → Drone-2 (3kg)
- Đơn 3.5kg: chưa drone nào mở → mở Drone-1, xếp vào, Drone-1 còn dư 0.5kg.
- Đơn 2kg: Drone-1 chỉ còn dư 0.5kg (không đủ) → mở Drone-2, xếp vào, Drone-2 còn dư 1kg.
- Đơn 1kg: trong các drone đã mở, Drone-1 dư 0.5kg (không đủ), Drone-2 dư 1kg (vừa khít) → xếp vào Drone-2, Drone-2 còn dư 0kg.
- Đơn 0.8kg: Drone-1 dư 0.5kg (không đủ), Drone-2 dư 0kg (không đủ), hết drone khả dụng →
  **đơn 0.8kg bị đánh dấu "không xếp được"**.

Kết quả: dùng 2 drone, lấp gần kín cả hai (Drone-1: 3.5/4kg = 87.5%, Drone-2: 3/3kg = 100%),
còn 1 đơn nhỏ cần xử lý thêm (điều drone khác, hoặc gộp chuyến sau).

---

## Tóm tắt toàn bộ luồng bằng 1 câu mỗi bước

| #   | Bước                   | Việc làm                                                                                     | Thuật toán / kỹ thuật                 |
| --- | ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| 0   | Nạp dữ liệu            | Đọc log các chuyến bay lịch sử                                                               | —                                     |
| 1   | Chọn manh mối          | Chọn các cột dữ liệu dùng để đoán năng lượng                                                 | Train/test split                      |
| 2   | Dạy AI đoán năng lượng | Train 5 mô hình, ép luật "nặng hơn = tốn điện hơn", chọn mô hình tốt nhất                    | Regression + Monotonic Constraint     |
| 3   | Dò tải trọng tối đa    | Dùng mô hình làm "trọng tài", chia đôi khoảng dò tìm tải trọng lớn nhất mà pin còn chịu được | **Binary Search**                     |
| 4   | Dựng hồ sơ             | Hồ sơ trung bình mỗi route + pin giả lập mỗi drone                                           | —                                     |
| 5   | Ma trận khả thi        | Tính tải trọng tối đa cho MỌI cặp (drone, route)                                             | Lặp Binary Search                     |
| 6   | Xếp đơn hàng vào drone | Định nghĩa thuật toán xếp hàng gần sát trần tải trọng                                        | **Bin Packing – Best-Fit Decreasing** |

**2 thuật toán quan trọng nhất của cả file:**

- **Binary Search** (bước 3) — tìm nhanh "tải trọng tối đa" bằng cách liên tục chia đôi khoảng dò tìm, giống trò đoán số.
- **Best-Fit Decreasing** (bước 6) — xếp đơn hàng nặng trước, luôn nhét vào chỗ vừa khít nhất, hết chỗ mới mở thêm drone mới, giống xếp đồ vào thùng carton sao cho đầy nhất và tốn ít thùng nhất.
