// script.js
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function hitungTotalPesanan() {
  let total = 0;

  document.querySelectorAll(".menu-check:checked").forEach((checkbox) => {
    const itemCard = checkbox.closest(".item-card");
    const jumlahInput = itemCard.querySelector(".jumlah-item");
    const jumlah = parseInt(jumlahInput.value) || 1;
    const harga = parseInt(checkbox.dataset.harga) || 0;

    total += harga * jumlah;
  });

  const totalElement = document.getElementById("totalPesanan");
  if (totalElement) {
    totalElement.value = formatRupiah(total);
  }

  return total;
}

function aktifkanDetailMenu() {
  const checkboxes = document.querySelectorAll(".menu-check");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const itemCard = this.closest(".item-card");
      const detailBox = itemCard.querySelector(".menu-detail");
      const jumlahInput = itemCard.querySelector(".jumlah-item");
      const catatanInput = itemCard.querySelector(".catatan-item");

      if (this.checked) {
        detailBox.classList.remove("d-none");
        jumlahInput.value = 1;
      } else {
        detailBox.classList.add("d-none");
        jumlahInput.value = 1;
        catatanInput.value = "";
      }

      hitungTotalPesanan();
    });
  });

  document.querySelectorAll(".jumlah-item").forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value === "" || parseInt(this.value) < 1) {
        this.value = 1;
      }
      hitungTotalPesanan();
    });
  });
}

function tambahPesanan(event) {
  event.preventDefault();

  const namaElement = document.getElementById("nama");
  const totalPesananElement = document.getElementById("totalPesanan");
  const formPesanan = document.getElementById("formPesanan");

  if (!formPesanan) return;

  const nama = namaElement ? namaElement.value.trim() : "";
  const totalNominal = hitungTotalPesanan();
  const totalPesanan = totalPesananElement ? totalPesananElement.value : formatRupiah(totalNominal);

  const jenisPesananRadio = document.querySelector('input[name="jenisPesanan"]:checked');
  const pembayaranRadio = document.querySelector('input[name="pembayaran"]:checked');

  const jenisPesanan = jenisPesananRadio ? jenisPesananRadio.value : "";
  const pembayaran = pembayaranRadio ? pembayaranRadio.value : "";

  const daftarPesanan = [];

  document.querySelectorAll(".menu-check:checked").forEach((checkbox) => {
    const itemCard = checkbox.closest(".item-card");
    const jumlahInput = itemCard.querySelector(".jumlah-item");
    const catatanInput = itemCard.querySelector(".catatan-item");

    const jumlah = parseInt(jumlahInput.value);
    const catatan = catatanInput.value.trim();
    const harga = parseInt(checkbox.dataset.harga) || 0;

    daftarPesanan.push({
      kategori: checkbox.dataset.kategori,
      namaMenu: checkbox.value,
      jumlah: isNaN(jumlah) || jumlah < 1 ? 1 : jumlah,
      harga: harga,
      subtotal: (isNaN(jumlah) || jumlah < 1 ? 1 : jumlah) * harga,
      catatan: catatan
    });
  });

  if (nama === "") {
    alert("Nama pemesan wajib diisi.");
    return;
  }

  if (daftarPesanan.length === 0) {
    alert("Pilih minimal satu menu.");
    return;
  }

  if (jenisPesanan === "") {
    alert("Pilih jenis pesanan terlebih dahulu.");
    return;
  }

  if (pembayaran === "") {
    alert("Pilih metode pembayaran terlebih dahulu.");
    return;
  }

  let dataPesanan = JSON.parse(localStorage.getItem("pesananBakmie")) || [];

  const pesananBaru = {
    id: Date.now(),
    nama: nama,
    jenisPesanan: jenisPesanan,
    pembayaran: pembayaran,
    totalPesanan: totalPesanan,
    totalNominal: totalNominal,
    daftarPesanan: daftarPesanan
  };

  dataPesanan.push(pesananBaru);
  localStorage.setItem("pesananBakmie", JSON.stringify(dataPesanan));

  alert("Pesanan berhasil ditambahkan!");
  formPesanan.reset();

  document.querySelectorAll(".menu-detail").forEach((detail) => {
    detail.classList.add("d-none");
  });

  document.querySelectorAll(".jumlah-item").forEach((input) => {
    input.value = 1;
  });

  document.querySelectorAll(".catatan-item").forEach((input) => {
    input.value = "";
  });

  if (totalPesananElement) {
    totalPesananElement.value = "Rp 0";
  }
}

function tampilkanPesanan() {
  const tabelBody = document.getElementById("tabelPesananBody");
  if (!tabelBody) return;

  let dataPesanan = JSON.parse(localStorage.getItem("pesananBakmie")) || [];
  tabelBody.innerHTML = "";

  if (dataPesanan.length === 0) {
    tabelBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-data">Belum ada data pesanan.</td>
      </tr>
    `;
    return;
  }

  dataPesanan.forEach((item, index) => {
    let detailPesananHTML = "";

    item.daftarPesanan.forEach((menuItem) => {
      detailPesananHTML += `
        <div class="detail-pesanan">
          <strong>${menuItem.kategori}</strong><br>
          ${menuItem.namaMenu}<br>
          Jumlah: ${menuItem.jumlah}<br>
          Harga: ${formatRupiah(menuItem.harga || 0)}<br>
          Subtotal: ${formatRupiah(menuItem.subtotal || 0)}<br>
          Catatan: ${menuItem.catatan !== "" ? menuItem.catatan : "-"}
        </div>
      `;
    });

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${detailPesananHTML}</td>
        <td>${item.jenisPesanan}</td>
        <td>${item.pembayaran}</td>
        <td>${item.totalPesanan ? item.totalPesanan : "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="hapusPesanan(${item.id})">Hapus</button>
        </td>
      </tr>
    `;

    tabelBody.innerHTML += row;
  });
}

function hapusPesanan(id) {
  let dataPesanan = JSON.parse(localStorage.getItem("pesananBakmie")) || [];
  dataPesanan = dataPesanan.filter((item) => item.id !== id);
  localStorage.setItem("pesananBakmie", JSON.stringify(dataPesanan));
  tampilkanPesanan();
}

function hapusSemuaPesanan() {
  localStorage.removeItem("pesananBakmie");
  tampilkanPesanan();
  alert("Semua data pesanan berhasil dihapus.");
}

document.addEventListener("DOMContentLoaded", function () {
  aktifkanDetailMenu();
  hitungTotalPesanan();
  tampilkanPesanan();
});